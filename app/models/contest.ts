import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { type userId } from './user.js'
import { Opaque } from '@adonisjs/core/types/helpers'

export type contestId = Opaque<'contestId', string>

export default class Contest extends BaseModel {
  @column({ isPrimary: true })
  declare id: contestId

  @column()
  declare userId: userId

  @column()
  declare name: string

  @column()
  declare status: string

  @column()
  declare startDate: DateTime

  @column()
  declare endDate: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
