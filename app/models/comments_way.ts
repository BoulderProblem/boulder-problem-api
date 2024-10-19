import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { type userId } from './user.js'
import { type wayId } from './way.js'

export default class CommentsWay extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: userId

  @column()
  declare way_id: wayId

  @column()
  declare text: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
