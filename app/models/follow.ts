import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { type userId } from './user.js'

export default class Follow extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_follower_id: userId

  @column()
  declare user_following_id: userId

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
