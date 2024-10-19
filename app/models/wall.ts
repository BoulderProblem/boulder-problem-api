import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { type zoneId } from './zone.js'
import { Opaque } from '@adonisjs/core/types/helpers'

export type wallId = Opaque<'wallId', string>

export default class Wall extends BaseModel {
  @column({ isPrimary: true })
  declare id: wallId

  @column()
  declare zone_id: zoneId

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
