// import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'

export default class AuthController {
  /**
   * @login
   * @summary login user
   * @requestBody {"email": "test@test.fr", "password": "test"}
   * @responseBody 200 - {"token": {"type": "bearer","name": "null","token": "oat_MTk.cVNCck0yZDEzRnVwc0p4MHZFaDhUTEVGOU5feUIyR0pERS04MUw0UTM5MjQ4NjI0Nzk","abilities": "['*']","lastUsedAt": "null","expiresAt": "2024-03-17T12:33:15.904Z"}}
   * @responseBody 400 - {"errors": [{ "message": "Invalid user credentials"}]}
   */
  async login({ request }: HttpContext) {
    const { email, password } = request.all()
    const user = await User.verifyCredentials(email.toLowerCase(), password)

    const token = await User.accessTokens.create(user)

    return token
  }

  /**
   * @logout
   * @summary Logout user
   * @responseBody 200 - {"revoked": true}
   * @returns
   */
  async logout({ auth }: HttpContext) {
    assert(auth.user, 'kindly login')

    await User.accessTokens.delete(auth.user, auth.user.currentAccessToken.identifier)
    return {
      revoked: true,
    }
  }
}
