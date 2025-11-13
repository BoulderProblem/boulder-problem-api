import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User, { type userId } from './user.js'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'
import { type placeId } from './place.js'

export default class UserPlace extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: userId

  @column()
  declare placeId: placeId

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
