import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import nodeFetch from 'node-fetch'
import { createUserValidator, updateUserValidator } from '#validators/user'
import Follow from '#models/follow'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import sharp from 'sharp'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

export default class UsersController {
  /**
   * @register
   * @summary create user
   * @requestBody {"email": "test@test.fr", "password": "test", "firstname": "Alexandre", "lastname": "Chabane", "birth_date": "1995/06/28", "genderId": "1"}
   * @responseBody 200 - {"token": "oat_MTk.cVNCck0yZDEzRnVwc0p4MHZFaDhUTEVGOU5feUIyR0pERS04MUw0UTM5MjQ4NjI0Nzk"}
   */
  async register({ request }: HttpContext) {
    let payload = await request.validateUsing(createUserValidator)

    const user = await User.create(payload)

    const token = await User.accessTokens.create(user)

    return token
  }

  async generate({ request }: HttpContext) {
    let results
    let url = 'https://randomuser.me/api/?nat=fr&results=1000'

    await nodeFetch(url)
      .then((response) => response.json())
      .then((data: any) => {
        results = data.results
      })

    for (let result of results) {
      let avatar = `${cuid()}.jpg`
      const response = await axios.get(result.picture.large, { responseType: 'arraybuffer' })
      console.log(response)

      await fs.writeFileSync('/home/node/app/build/uploads/users/' + avatar, response.data)

      let user = {
        firstname: result.name.first,
        lastname: result.name.last,
        email: result.email,
        password: result.login.password,
        birth_date: result.dob.date.slice(0, 10),
        gender_id: result.gender === 'female' ? 2 : 1,
        avatar: avatar,
        created_at: DateTime.local().minus({ days: Math.floor(Math.random() * 365) }),
      }
      await User.create(user)
    }
    // const user = await User.create(data)

    return
  }

  /**
   * @getUsers
   * @summary getAll users
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getUsers({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id
    let search = request.only(['search']).search
    let page = request.only(['page']).page
    if (!page) {
      page = 1
    }

    return await User.query()
      .select('id', 'firstname', 'lastname', 'avatar', 'email', 'roleId')
      .withCount('followers', (query) => query.count('*').as('nb_follower'))
      .withCount('followings', (query) => query.count('*').as('nb_following'))
      .withCount('followers', (query) =>
        query.count('*').as('is_following').where('user_follower_id', user_id)
      )
      .whereILike('firstname', '%' + search + '%')
      .orWhereILike('lastname', '%' + search + '%')
      .orWhereILike('email', '%' + search + '%')
      .orderBy('is_following', 'desc')
      .orderBy('firstname', 'asc')
      .orderBy('lastname', 'asc')
      .paginate(page, 10)
  }

  /**
   * @getUser
   * @summary get current user
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getUser({ auth }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id

    let user = await User.query()
      .withCount('followers', (query) => query.count('*').as('nb_follower'))
      .withCount('followings', (query) => query.count('*').as('nb_following'))
      .withCount('posts', (query) => query.count('*').as('nb_post'))
      .where('id', user_id)
      .first()
    return user?.serializeWithExtras({ nbPost: true, nbFollower: true, nbFollowing: true })
  }
  /**
   * @updateUserId
   * @summary update user
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async updateUserId({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id
    let payload = await request.validateUsing(updateUserValidator)
    let user = await User.findOrFail(request.params().id)

    // TODO delete old avatar

    let avatar = user.avatar
    if (payload.avatar) {
      // create unique image name
      avatar = `${cuid()}.${payload.avatar.extname}`
      // save image
      payload.avatar.move(app.makePath('uploads/users'), {
        name: avatar,
      })
    }

    await user.merge({ ...payload, ...{ avatar } }).save()

    return await User.query()
      .withCount('followers', (query) => query.count('*').as('nb_follower'))
      .withCount('followings', (query) => query.count('*').as('nb_following'))
      .withCount('followers', (query) =>
        query.count('*').as('is_following').where('user_follower_id', user_id)
      )
      .where('id', request.params().id)
      .first()
  }

  /**
   * @getUserId
   * @summary get specific user
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getUserId({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id
    return await User.query()
      .withCount('followers', (query) => query.count('*').as('nb_follower'))
      .withCount('followings', (query) => query.count('*').as('nb_following'))
      .withCount('followers', (query) =>
        query.count('*').as('is_following').where('user_follower_id', user_id)
      )
      .where('id', request.params().id)
      .first()
  }

  /**
   * @getAvatar
   * @summary get user image
   * @responseBody 200 - image 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getAvatar({ request, response }: HttpContext) {
    let user = await User.findOrFail(request.params().id)
    let size = 500
    if (request.qs().size) {
      size = parseInt(request.qs().size)
    }

    if (user.avatar === request.params().id_avatar) {
      const buffer = await sharp('./uploads/users/' + request.params().id_avatar)
        .resize(size)
        .toBuffer()
      response.header('Content-Type', 'image/' + request.params().id_avatar.split('.')[1])
      return response.send(buffer)
    } else {
      return response.status(422).send("nom de l'avatar incorrect")
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
      return await User.query()
        .withCount('followers', (query) => query.count('*').as('nb_follower'))
        .withCount('followings', (query) => query.count('*').as('nb_following'))
        .withCount('followers', (query) =>
          query.count('*').as('is_following').where('user_follower_id', user_follower_id)
        )
        .where('id', user_following_id)
    } else {
      // unlike
      await Follow.query()
        .where('user_follower_id', user_follower_id)
        .andWhere('user_following_id', user_following_id)
        .delete()

      return await User.query()
        .withCount('followers', (query) => query.count('*').as('nb_follower'))
        .withCount('followings', (query) => query.count('*').as('nb_following'))
        .withCount('followers', (query) =>
          query.count('*').as('is_following').where('user_follower_id', user_follower_id)
        )
        .where('id', user_following_id)
    }
  }
}
