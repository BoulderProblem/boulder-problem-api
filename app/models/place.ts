import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { Database } from '@adonisjs/lucid/database'

export default class Place extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare coordinate: any

  @column()
  declare geocoordinate: any

  @column()
  declare osm_id: string

  @column()
  declare sport_center: boolean

  @column()
  declare name: string

  @column()
  declare hours: string

  @column()
  declare phone: string

  @column()
  declare website: string

  @column()
  declare city: string

  @column()
  declare postal_code: string

  @column()
  declare address: string

  @column()
  declare outdoor: boolean

  @column()
  declare grade_min: string

  @column()
  declare grade_max: string

  @column()
  declare length_min: string

  @column()
  declare length_max: string

  @column()
  declare routes: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
