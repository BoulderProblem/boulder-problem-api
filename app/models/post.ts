import { DateTime } from 'luxon'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { column, BaseModel, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import User, { type userId } from './user.js'
import Like from './like.js'
import Comment from './comment.js'
import { Opaque } from '@adonisjs/core/types/helpers'

export type postId = Opaque<'postId', string>

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  declare id: postId

  @column()
  declare title: string

  @column()
  declare image: string[]

  @column()
  declare text: string

  @column()
  declare location: string

  @column()
  declare user_id: userId

  @column({
    serialize: (value: string) => {
      return parseInt(value)
    },
  })
  declare likes_count: number

  @column({
    serialize: (value: string) => {
      return parseInt(value)
    },
  })
  declare comments_count: number

  @column({
    serialize: (value: string) => {
      return Boolean(parseInt(value))
    },
  })
  declare is_like: boolean

  @hasMany(() => Like, {
    foreignKey: 'post_id',
    serializeAs: null,
  })
  declare likes: HasMany<typeof Like>

  @hasMany(() => Comment, {
    foreignKey: 'post_id',
  })
  declare comments: HasMany<typeof Comment>

  @belongsTo(() => User, { foreignKey: 'user_id' })
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
