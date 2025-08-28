import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import Wall, { type wallId } from './wall.js'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Color from './color.js'
import Difficulty from './difficulty.js'
import { Opaque } from '@adonisjs/core/types/helpers'
import NotesWay from './notes_way.js'
import ValidWay from './valid_way.js'

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

  @column({
    serialize: (value: string) => {
      return parseFloat(parseFloat(value).toFixed(2))
    },
  })
  declare note: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare deleteAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
