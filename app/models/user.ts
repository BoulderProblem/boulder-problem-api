import { DateTime } from 'luxon'
import { withAuthFinder } from '@adonisjs/auth'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, beforeSave, column, hasMany } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Follow from './follow.js'
import Like from './like.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare firstname: string

  @column()
  declare lastname: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare birth_date: Date

  @column()
  declare role_id: number

  @column()
  declare gender_id: number

  @column()
  declare follower: number

  @column()
  declare following: number

  @hasMany(() => Follow, {
    foreignKey: 'user_following_id',
    onQuery(query) {
      query.count('*').as('follower')
    },
  })
  declare followers: HasMany<typeof Follow>

  @hasMany(() => Follow, {
    foreignKey: 'user_follower_id',
    serializeAs: null,
  })
  declare followings: HasMany<typeof Follow>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    prefix: 'oat_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })
}
