import Message from '#models/messages'
import { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import { createConversationValidator } from '#validators/message'
import Conversation from '#models/conversation'
import UsersConversation from '#models/users_conversation'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

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
        const conv = await Conversation.create({ name: payload.name || '', creatorId: user_id })

        for (let id of payload.userIds) {
          await UsersConversation.create({ userId: id, conversationId: conv.id })
        }

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
          .where('id', conv.id)
          .andWhere((query) => {
            query.where('creatorId', user_id).orWhereHas('messages', (q2) => {
              q2.where('senderId', user_id).orWhere('receiverId', user_id)
            })
          })
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
          query.select('id', 'firstname', 'lastname', 'publicKey')
        })
      })
      .preload('latestMessage', (query) => {
        query
          .where((q) => {
            q.where('senderId', user_id).orWhere('receiverId', user_id)
          })
          .orderBy('createdAt', 'desc')
          .limit(1)
      })
      .withCount('messages', (query) => {
        query
          .count('*')
          .as('unread_messages')
          .where('receiver_id', user_id)
          .andWhereRaw(
            `messages.created_at > COALESCE(
            (SELECT last_read_at 
             FROM users_conversations uc 
             WHERE uc.conversation_id = messages.conversation_id 
             AND uc.user_id = ?), '1970-01-01')`,
            [user_id]
          )
      })
      .where('creatorId', user_id)
      .orWhereHas('messages', (query) => {
        query.where('senderId', user_id).orWhere('receiverId', user_id)
      })
  }

  async getConversationid({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id
    let convId = request.params().id

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
      .withCount('messages', (query) => {
        query
          .count('*')
          .as('unread_messages')
          .where('receiver_id', user_id)
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
      .andWhere((query) => {
        query.where('creatorId', user_id).orWhereHas('messages', (q2) => {
          q2.where('senderId', user_id).orWhere('receiverId', user_id)
        })
      })
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
    const data = request.only([
      'sender_id',
      'receiver_id',
      'ciphertext',
      'nonce',
      'sender_pub',
      'recipient_pub',
      'conversationId',
    ])

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

    if (convId) {
      if (before) {
        messages = await Message.query()
          .where('conversationId', convId)
          .andWhere('createdAt', '<', before)
          .andWhere((query) => {
            query.where('senderId', user_id).orWhere('receiverId', user_id)
          })
          .orderBy('createdAt', 'desc')
          .limit(100)
        return messages
      } else {
        messages = await Message.query()
          .where('conversationId', convId)
          .andWhere((query) => {
            query.where('senderId', user_id).orWhere('receiverId', user_id)
          })
          .orderBy('createdAt', 'desc')
          .limit(100)
      }
    }
    return messages
  }
}
