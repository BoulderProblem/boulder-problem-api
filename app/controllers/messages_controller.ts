import Message from '#models/messages'
import { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import { createConversationValidator } from '#validators/message'
import Conversation from '#models/conversation'
import UsersConversation from '#models/users_conversation'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import {
  encryptGroupKeyForUser,
  encryptPrivateKey,
  generateGroupKey,
  generateKeys,
} from '#services/crypto'
import User from '#models/user'
import GroupKeys from '#models/group_keys'
import env from '#start/env'

export default class MessagesController {
  async createConversations({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(createConversationValidator)
    let user_id = auth.user.id
    if (payload.userIds.includes(user_id)) {
      const existing = await db
        .from('users_conversations as uc')
        .select('uc.conversation_id')
        .whereIn('uc.user_id', payload.userIds)
        .groupBy('uc.conversation_id')
        // Vérifie que tous les userIds sont présents
        .havingRaw('COUNT(DISTINCT uc.user_id) = ?', [payload.userIds.length])
        // Vérifie qu'il n'y a pas d'autres users dans la même conversation
        .havingRaw(
          `
      COUNT(DISTINCT uc.user_id) = (
        SELECT COUNT(*) FROM users_conversations uc2 
        WHERE uc2.conversation_id = uc.conversation_id
      )
    `
        )
        .first()

      if (existing) {
        return existing
      } else {
        const key = await generateGroupKey()
        const conv = await Conversation.create({
          name: payload.name || '',
          creatorId: user_id,
          key_version: 1,
        })

        for (let id of payload.userIds) {
          let user = await User.findOrFail(id)

          const encrypted = await encryptGroupKeyForUser(
            key,
            user.publicKey,
            env.get('SERVER_MASTER_PRIVATE_KEY') as string
          )

          await UsersConversation.create({ userId: id, conversationId: conv.id })
          await GroupKeys.create({
            userId: id,
            conversationId: conv.id,
            version: 1,
            ciphertext: encrypted.ciphertext,
            nonce: encrypted.nonce,
          })
        }

        return await Conversation.query()
          .preload('usersConversation', (usersConversation) => {
            usersConversation.preload('user', (query) => {
              query.select('id', 'firstname', 'lastname', 'publicKey') // Sélectionner seulement la colonne 'bio' pour la relation 'profile'
            })
          })
          .preload('messages', (query) => {
            query.orderBy('createdAt', 'desc').limit(1)
          })
          .preload('groupKeys', (query) => {
            query.where('userId', user_id)
          })
          .where('id', conv.id)
      }
    } else {
      return
    }
  }

  async getConversations({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id

    return await Conversation.query()
      .preload('usersConversation', (usersConversation) => {
        usersConversation.preload('user', (query) => {
          query.select('id', 'firstname', 'lastname', 'publicKey') // Sélectionner seulement la colonne 'bio' pour la relation 'profile'
        })
      })
      .preload('latestMessage', (query) => {
        query.orderBy('createdAt', 'desc').limit(1)
      })
      .preload('groupKeys', (query) => {
        query.where('userId', user_id)
      })
      .whereHas('usersConversation', (query) => {
        query.where('user_id', user_id) // Vérifier si l'utilisateur est dans la conversation avec l'utilisateur connecté
      })
  }

  async getConversationid({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id
    let convId = request.params().id

    await UsersConversation.query()
      .where('conversation_id', convId)
      .andWhere('user_id', user_id)
      .firstOrFail()

    return await Conversation.query()
      .preload('usersConversation', (usersConversation) => {
        usersConversation.preload('user', (query) => {
          query.select('id', 'firstname', 'lastname', 'publicKey') // Sélectionner seulement la colonne 'bio' pour la relation 'profile'
        })
      })
      .preload('messages', (query) => {
        query
          .where('senderId', user_id)
          .orWhere('receiverId', user_id)
          .orderBy('createdAt', 'desc')
          .limit(1)
      })
      .preload('groupKeys', (query) => {
        query.where('userId', user_id)
      })
      .withCount('messages', (query) => {
        query
          .count('*')
          .as('unread_messages')
          .andWhereRaw(
            `messages.created_at > COALESCE(
            (SELECT last_read_at 
             FROM users_conversations uc 
             WHERE uc.conversation_id = messages.conversation_id 
             AND uc.user_id = ?), '1970-01-01')`,
            [user_id]
          )
      })
      .where('id', convId)
  }

  async getConversationidRead({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id
    let convId = request.params().id

    let userConv = await UsersConversation.query()
      .where('conversation_id', convId)
      .andWhere('user_id', user_id)
      .firstOrFail()

    userConv.lastReadAt = DateTime.local()
    await userConv.save()
    return { success: true }
  }

  async store({ request }: HttpContext) {
    const data = request.only(['sender_id', 'ciphertext', 'nonce', 'conversationId', 'key_version'])

    const message = await Message.create(data)
    // update conv
    let conv = await Conversation.findOrFail(data.conversationId)
    conv.merge({ updatedAt: DateTime.local() }).save()
    return message
  }

  async getMessages({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id
    let { convId, before } = request.qs()

    let messages: any[] = []

    await UsersConversation.query()
      .where('conversation_id', convId)
      .andWhere('user_id', user_id)
      .firstOrFail()

    if (convId) {
      if (before) {
        messages = await Message.query()
          .where('conversationId', convId)
          .andWhere('createdAt', '<', before)
          .orderBy('createdAt', 'desc')
          .limit(100)
        return messages
      } else {
        messages = await Message.query()
          .where('conversationId', convId)
          .orderBy('createdAt', 'desc')
          .limit(100)
      }
    }
    return messages
  }
}
