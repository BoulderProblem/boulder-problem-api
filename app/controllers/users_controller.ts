import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import { createUserValidator, updateUserValidator } from '#validators/user'
import Follow from '#models/follow'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import fs from 'fs'

export default class UsersController {
  /**
   * @register
   * @summary create user
   * @requestBody {"email": "test@test.fr", "password": "test", "firstname": "Alexandre", "lastname": "Chabane", "birth_date": "1995/06/28", "gender_id": "1"}
   * @responseBody 200 - {"token": "oat_MTk.cVNCck0yZDEzRnVwc0p4MHZFaDhUTEVGOU5feUIyR0pERS04MUw0UTM5MjQ4NjI0Nzk"}
   */
  async register({ request }: HttpContext) {
    let payload = await request.validateUsing(createUserValidator)

    const user = await User.create(payload)

    const token = await User.accessTokens.create(user)

    return token
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
   * @getUser
   * @summary get current user
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getUser({ auth }: HttpContext) {
    assert(auth.user, 'kindly login')
    return await User.query()
      .withCount('followers', (query) => query.count('*').as('follower'))
      .withCount('followings', (query) => query.count('*').as('following'))
      .where('id', auth.user.id)
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

    let avatar = user.avatar
    if (payload.avatar) {
      // create unique image name
      avatar = `${cuid()}.${payload.avatar.extname}`
      // save image
      payload.avatar.move(app.makePath('uploads/users'), {
        name: avatar,
      })
    }

    await user.merge({ ...payload, ...{ avatar }, ...{ updatedAt: DateTime.local() } }).save()

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
   * @getAvatar
   * @summary get user image
   * @responseBody 200 - image 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getAvatar({ request, response }: HttpContext) {
    let user = await User.findOrFail(request.params().id)
    if (user.avatar === request.params().id_avatar) {
      const image = fs.createReadStream('./uploads/users/' + request.params().id_avatar)

      response.stream(image)
    } else {
      response.status(422).send("nom de l'avatar incorrect")
      return
    }
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
