import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Zone, { type zoneId } from './zone.js'
import { Opaque } from '@adonisjs/core/types/helpers'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'

export type wallId = Opaque<'wallId', string>

export default class Wall extends BaseModel {
  @column({ isPrimary: true })
  declare id: wallId

  @column()
  declare zoneId: zoneId

  @column()
  declare name: string

  @belongsTo(() => Zone, {
    foreignKey: 'zoneId',
  })
  declare zone: BelongsTo<typeof Zone>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
