import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Way, { type wayId } from './way.js'
import { type userId } from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class ValidWay extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: userId

  @column()
  declare wayId: wayId

  @column()
  declare status: string

  @belongsTo(() => Way)
  declare way: BelongsTo<typeof Way>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
