import { DateTime } from 'luxon'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { column, BaseModel, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import Like from './like.js'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare image: string

  @column()
  declare text: string

  @column()
  declare user_id: string

  @column()
  declare likes_count: number

  @column()
  declare is_like: number

  @hasMany(() => Like, {
    foreignKey: 'post_id',
    serializeAs: null,
  })
  declare likes: HasMany<typeof Like>

  @belongsTo(() => User, { foreignKey: 'user_id' })
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
