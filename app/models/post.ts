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
  declare userId: userId

  @column()
  declare session: number

  @column()
  declare startTime: Date

  @column()
  declare endTime: Date

  @column()
  declare activity: number

  @column()
  declare feeling: number

  @column()
  declare privateNote: string

  @column()
  declare materials: number

  @column()
  declare visibility: number

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
    foreignKey: 'postId',
    serializeAs: null,
  })
  declare likes: HasMany<typeof Like>

  @hasMany(() => Comment, {
    foreignKey: 'postId',
  })
  declare comments: HasMany<typeof Comment>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
