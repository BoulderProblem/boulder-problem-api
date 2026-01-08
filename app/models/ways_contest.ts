import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { type wayId } from './way.js'
import { type contestId } from './contest.js'

export default class WaysContest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare wayId: wayId

  @column()
  declare contestId: contestId

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
