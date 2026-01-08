import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { Opaque } from '@adonisjs/core/types/helpers'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import FavoritePlace from './favorite_place.js'
import User from './user.js'

export type placeId = Opaque<'placeId', number>

export default class Place extends BaseModel {
  @column({ isPrimary: true })
  declare id: placeId

  @column()
  declare coordinate: any

  @column()
  declare geocoordinate: any

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
    foreignKey: 'placeId',
    serializeAs: null,
  })
  declare favorite: HasMany<typeof FavoritePlace>

  @manyToMany(() => User, {
    pivotTable: 'user_places',
    localKey: 'id', // clé primaire dans users
    pivotForeignKey: 'place_id',
    relatedKey: 'id', // clé primaire dans contests
    pivotRelatedForeignKey: 'user_id',
  })
  declare owners: ManyToMany<typeof User>

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
