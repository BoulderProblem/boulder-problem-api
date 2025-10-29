import { DateTime } from 'luxon'
import { BaseModel, column, computed } from '@adonisjs/lucid/orm'
import { type userId } from './user.js'
import { type wayId } from './way.js'

export default class NotesWay extends BaseModel {
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare user_id: userId

  @column()
  declare wayId: wayId

  @column()
  declare note: Float32Array

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  get avgNote() {
    // $extras.avg_note contient la valeur renvoyée par SQL (souvent en string)
    const raw = (this as any).$extras?.avg
    if (raw !== undefined && raw !== null) return Number(parseFloat(String(raw)).toFixed(2))
  }
}
