import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User, { type userId } from './user.js'
import { type wayId } from './way.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class CommentsWay extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: userId

  @column()
  declare way_id: wayId

  @column()
  declare text: string

  @belongsTo(() => User, { foreignKey: 'user_id' })
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
