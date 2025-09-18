import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Place, { type placeId } from './place.js'
import { Opaque } from '@adonisjs/core/types/helpers'
import { type HasMany, type BelongsTo } from '@adonisjs/lucid/types/relations'
import Wall from './wall.js'

export type zoneId = Opaque<'zoneId', string>

export default class Zone extends BaseModel {
  @column({ isPrimary: true })
  declare id: zoneId

  @column()
  declare placeId: placeId

  @column()
  declare name: string

  @column()
  declare floor: string

  @column()
  declare image: string

  @belongsTo(() => Place, {
    foreignKey: 'placeId',
  })
  declare place: BelongsTo<typeof Place>

  @hasMany(() => Wall, {
    foreignKey: 'zoneId',
  })
  declare walls: HasMany<typeof Wall>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
