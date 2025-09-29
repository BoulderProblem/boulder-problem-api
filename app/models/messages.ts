import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { type userId } from './user.js'
import { type conversationId } from './conversation.js'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare conversationId: conversationId

  @column()
  declare senderId: userId

  @column()
  declare receiverId: userId

  @column()
  declare ciphertext: string

  @column()
  declare nonce: string

  @column()
  declare senderPub: string

  @column()
  declare recipientPub: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
