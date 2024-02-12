// import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import { createUserValidator } from '#validators/auth'

export default class AuthController {
  async login({ request }: HttpContext) {
    const { email, password } = request.all()
    console.log(request.all())
    const user = await User.verifyCredentials(email, password)

    const token = await User.accessTokens.create(user)

    return { user, token }
  }
  async logout({ auth }: HttpContext) {
    assert(auth.user, 'kindly login')

    await User.accessTokens.delete(auth.user, auth.user.currentAccessToken.identifier)
    return {
      revoked: true,
    }
  }
  async register({ request }: HttpContext) {
    let payload = await request.validateUsing(createUserValidator)

    const user = await User.create(payload)

    const token = await User.accessTokens.create(user)

    return { user, token }
  }
}
