import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { type placeId } from './place.js'
import { Opaque } from '@adonisjs/core/types/helpers'

export type zoneId = Opaque<'zoneId', string>

export default class Zone extends BaseModel {
  @column({ isPrimary: true })
  declare id: zoneId

  @column()
  declare place_id: placeId

  @column()
  declare name: string

  @column()
  declare floor: string

  @column()
  declare image: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
