import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import { createUserValidator, updateUserValidator } from '#validators/user'
import Follow from '#models/follow'
import { DateTime } from 'luxon'

export default class UsersController {
  /**
   * @register
   * @summary create user
   */
  async register({ request }: HttpContext) {
    let payload = await request.validateUsing(createUserValidator)

    const user = await User.create(payload)

    const token = await User.accessTokens.create(user)

    return { user, token }
  }

  /**
   * @getUsers
   * @summary getAll users
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getUsers({ auth }: HttpContext) {
    assert(auth.user, 'kindly login')
    return await User.query()
      .withCount('followers', (query) => query.count('*').as('follower'))
      .withCount('followings', (query) => query.count('*').as('following'))
  }
  /**
   * @updateUserId
   * @summary update user
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async updateUserId({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(updateUserValidator)
    let user = await User.findOrFail(request.params().id)
    await user.merge({ ...payload, ...{ updatedAt: DateTime.local() } }).save()

    return user
  }

  /**
   * @getUserId
   * @summary get specific user
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getUserId({ request }: HttpContext) {
    return await User.query()
      .withCount('followers', (query) => query.count('*').as('follower'))
      .withCount('followings', (query) => query.count('*').as('following'))
      .where('id', request.params().id)
  }

  /**
   * @followUser
   * @summary follow or unfollow user
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async followUser({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_following_id = request.params().id
    let user_follower_id = auth.user.id

    // check if post exist
    await User.findOrFail(user_following_id)

    let follow = await Follow.query()
      .where('user_follower_id', user_follower_id)
      .andWhere('user_following_id', user_following_id)
    console.log(follow.length)

    if (follow.length === 0) {
      // create like
      await Follow.create({ user_follower_id, user_following_id })
      return await User.query().preload('followers').where('id', user_following_id)
    } else {
      // unlike
      await Follow.query()
        .where('user_follower_id', user_follower_id)
        .andWhere('user_following_id', user_following_id)
        .delete()

      return await User.query().preload('followers').where('id', user_following_id)
    }
  }
}
