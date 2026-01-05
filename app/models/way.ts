import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed, hasMany, hasOne } from '@adonisjs/lucid/orm'
import Wall, { type wallId } from './wall.js'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Color from './color.js'
import Difficulty from './difficulty.js'
import { Opaque } from '@adonisjs/core/types/helpers'
import NotesWay from './notes_way.js'
import ValidWay from './valid_way.js'
import CommentsWay from './comments_way.js'

export type wayId = Opaque<'wayId', string>

export default class Way extends BaseModel {
  @column({ isPrimary: true })
  declare id: wayId

  @column()
  declare wallId: wallId

  @column()
  declare colorId: number

  @column()
  declare difficultyId: number

  @column()
  declare style: string

  @column()
  declare routeSetter: string

  @column()
  declare name: string

  @column()
  declare image: string | null

  @belongsTo(() => Color, {
    foreignKey: 'colorId',
  })
  declare color: BelongsTo<typeof Color>

  @belongsTo(() => Difficulty, {
    foreignKey: 'difficultyId',
  })
  declare difficulty: BelongsTo<typeof Difficulty>

  @belongsTo(() => Wall, {
    foreignKey: 'wallId',
  })
  declare wall: BelongsTo<typeof Wall>

  @hasOne(() => ValidWay, {
    foreignKey: 'wayId',
  })
  declare valid: HasOne<typeof ValidWay>

  @hasMany(() => NotesWay, {
    foreignKey: 'wayId',
    serializeAs: null,
  })
  declare notes: HasMany<typeof NotesWay>

  @hasMany(() => NotesWay, {
    foreignKey: 'wayId',
    serializeAs: null,
  })
  declare avgnotes: HasMany<typeof NotesWay>

  @hasMany(() => CommentsWay, {
    foreignKey: 'wayId',
    serializeAs: null,
  })
  declare comments: HasMany<typeof CommentsWay>

  @computed()
  get avgNote() {
    // $extras.avg_note contient la valeur renvoyée par SQL (souvent en string)
    const raw = (this as any).$extras?.avg_note
    if (raw === undefined || raw === null) return null
    return Number(parseFloat(String(raw)).toFixed(2))
  }

  @computed()
  get nbComments() {
    const raw = (this as any).$extras?.nbComments
    return raw === undefined ? 0 : Number(raw)
  }

  @computed()
  get userNote() {
    return this.notes?.[0] ?? null
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare deleteAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
