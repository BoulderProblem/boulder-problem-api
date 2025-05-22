import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { Opaque } from '@adonisjs/core/types/helpers'
import Like from './like.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import FavoritePlace from './favorite_place.js'
import User, { type userId } from './user.js'

export type placeId = Opaque<'placeId', string>

export default class Place extends BaseModel {
  @column({ isPrimary: true })
  declare id: placeId

  @column()
  declare coordinate: any

  @column()
  declare geocoordinate: any

  @column()
  declare ownerId: userId

  @belongsTo(() => User, { foreignKey: 'ownerId' })
  declare owner: BelongsTo<typeof User>

  @column({
    serialize: (value: string) => {
      return parseInt(value)
    },
  })
  declare favorite_count: number

  @column({
    serialize: (value: string) => {
      return Boolean(parseInt(value))
    },
  })
  declare is_favorite: boolean

  @hasMany(() => FavoritePlace, {
    foreignKey: 'place_id',
    serializeAs: null,
  })
  declare favorite: HasMany<typeof FavoritePlace>

  @column()
  declare osmId: string

  @column()
  declare sportCenter: boolean

  @column()
  declare name: string

  @column()
  declare logo: string

  @column()
  declare hours: string

  @column()
  declare phone: string

  @column()
  declare website: string

  @column()
  declare city: string

  @column()
  declare postalCode: string

  @column()
  declare houseNumber: string

  @column()
  declare street: string

  @column()
  declare address: string

  @column()
  declare outdoor: boolean

  @column()
  declare gradeMin: string

  @column()
  declare gradeMax: string

  @column()
  declare lengthMin: string

  @column()
  declare lengthMax: string

  @column()
  declare routes: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
