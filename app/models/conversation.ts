import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { Opaque } from '@adonisjs/core/types/helpers'
import UsersConversation from './users_conversation.js'
import { type HasMany } from '@adonisjs/lucid/types/relations'
import Message from './messages.js'
import { type userId } from './user.js'
import GroupKeys from './group_keys.js'

export type conversationId = Opaque<'conversationId', string>

export default class Conversation extends BaseModel {
  @column({ isPrimary: true })
  declare id: conversationId

  @column()
  declare creatorId: userId

  @column()
  declare name: string

  @column()
  declare key_version: number

  @hasMany(() => UsersConversation, {
    foreignKey: 'conversationId',
  })
  declare usersConversation: HasMany<typeof UsersConversation>

  @hasMany(() => GroupKeys, {
    foreignKey: 'conversationId',
  })
  declare groupKeys: HasMany<typeof GroupKeys>

  @hasMany(() => Message, {
    foreignKey: 'conversationId',
  })
  declare messages: HasMany<typeof Message>

  @hasMany(() => Message, {
    foreignKey: 'conversationId',
  })
  declare latestMessage: HasMany<typeof Message>

  @column({
    serialize: (value: string) => {
      return parseInt(value)
    },
  })
  declare unread_messages: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
