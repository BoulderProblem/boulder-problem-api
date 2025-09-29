import { DateTime } from 'luxon'
import { withAuthFinder } from '@adonisjs/auth'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Follow from './follow.js'
import { Opaque } from '@adonisjs/core/types/helpers'
import Post from './post.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export type userId = Opaque<'userId', string>

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: userId

  @column()
  // @example(Alexandre)
  declare firstname: string

  @column()
  // @example(Chabane)
  declare lastname: string

  @column()
  declare fullname: string

  @column()
  // @example(johndoe@example.com)
  declare email: string

  @column()
  // avatar.jpg
  declare avatar: string

  @column()
  declare bio: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  // @example(28-06-1995)
  declare birth_date: Date

  @column()
  declare roleId: number

  @column()
  declare genderId: number

  @column()
  declare publicKey: string

  public get nbFollower(): number {
    return Number(this.$extras.nb_follower ?? 0)
  }
  public get nbFollowing(): number {
    return Number(this.$extras.nb_following ?? 0)
  }
  public get nbPost(): number {
    return Number(this.$extras.nb_post ?? 0)
  }

  @hasMany(() => Follow, {
    foreignKey: 'user_following_id',
    serializeAs: null,
  })
  declare followers: HasMany<typeof Follow>

  @hasMany(() => Follow, {
    foreignKey: 'user_follower_id',
    serializeAs: null,
  })
  declare followings: HasMany<typeof Follow>

  @hasMany(() => Post, {
    foreignKey: 'user_id',
    serializeAs: null,
  })
  declare posts: HasMany<typeof Post>

  @column({
    serialize: (value: string) => {
      return Boolean(parseInt(value))
    },
  })
  declare is_following: boolean

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

  public serializeWithExtras(options?: {
    nbPost?: boolean
    nbFollower?: boolean
    nbFollowing?: boolean
  }) {
    let json = this.toJSON()
    if (options?.nbPost) {
      json = {
        ...json,
        nbPost: this.nbPost,
      }
    }
    if (options?.nbFollower) {
      json = {
        ...json,
        nbFollower: this.nbFollower,
      }
    }
    if (options?.nbFollowing) {
      json = {
        ...json,
        nbFollowing: this.nbFollowing,
      }
    }
    return json
  }
}
