import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { column, BaseModel, belongsTo } from '@adonisjs/lucid/orm'
import User, { type userId } from './user.js'

export default class ResetPassword extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: userId

  @belongsTo(() => User, { foreignKey: 'user_id' })
  declare user: BelongsTo<typeof User>

  @column()
  declare code: number

  @column()
  declare email: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
