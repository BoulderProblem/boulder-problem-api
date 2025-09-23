import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { Opaque } from '@adonisjs/core/types/helpers'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import UsersContest from './users_contest.js'
import { type placeId } from './place.js'
import { type userId } from './user.js'

export type contestId = Opaque<'contestId', string>

export default class Contest extends BaseModel {
  @column({ isPrimary: true })
  declare id: contestId

  @column()
  declare userId: userId

  @column()
  declare placeId: placeId

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare status: string

  @column()
  declare startDate: DateTime

  @column()
  declare endDate: DateTime

  @column({
    serialize: (value: string) => {
      return parseInt(value)
    },
  })
  declare follow_count: number

  @hasMany(() => UsersContest, {
    foreignKey: 'contestId',
    serializeAs: null,
  })
  declare follow: HasMany<typeof UsersContest>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
