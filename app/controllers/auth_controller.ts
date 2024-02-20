// import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'

export default class AuthController {
  /**
   * @login
   * @summary login user
   * @requestBody {"email": "test@test.fr", "password": "test"}
   * @responseBody 200 - {"user": {"id": "f1e1e01c-3595-4d30-8f37-e3a66d24f54b","firstname": "Alexandre","lastname": "Chabane","email": "test@test.fr","birthDate": "1995-06-28T00:00:00.000Z","createdAt": "2024-02-12T21:52:05.180+00:00","updatedAt": "2024-02-12T21:52:05.180+00:00","roleId": 1,"genderId": 1},"token": {"type": "bearer","name": "null","token": "oat_MTk.cVNCck0yZDEzRnVwc0p4MHZFaDhUTEVGOU5feUIyR0pERS04MUw0UTM5MjQ4NjI0Nzk","abilities": "['*']","lastUsedAt": "null","expiresAt": "2024-03-17T12:33:15.904Z"}}
   * @responseBody 400 - {"errors": [{ "message": "Invalid user credentials"}]}
   */
  async login({ request }: HttpContext) {
    const { email, password } = request.all()
    console.log(request.all())
    const user = await User.verifyCredentials(email, password)

    const token = await User.accessTokens.create(user)

    return { user, token }
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
