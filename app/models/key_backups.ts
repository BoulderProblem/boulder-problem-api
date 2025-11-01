import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { type userId } from './user.js'

export default class KeyBackups extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: userId

  @column()
  declare ciphertext: string

  @column()
  declare nonce: string

  @column()
  declare salt: string

  @column()
  declare ciphertext_srv: string

  @column()
  declare nonce_srv: string

  @column()
  declare salt_srv: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
