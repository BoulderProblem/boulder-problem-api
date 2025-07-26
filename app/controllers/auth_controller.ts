// import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import { loginValidator, lostPasswordValidator, resetPasswordValidator } from '#validators/auth'
import mail from '@adonisjs/mail/services/main'
import ResetPassword from '#models/reset_password'

import { DateTime, Interval } from 'luxon'

export default class AuthController {
  /**
   * @login
   * @summary login user
   * @requestBody {"email": "test@test.fr", "password": "test"}
   * @responseBody 200 - {"token": {"type": "bearer","name": "null","token": "oat_MTk.cVNCck0yZDEzRnVwc0p4MHZFaDhUTEVGOU5feUIyR0pERS04MUw0UTM5MjQ4NjI0Nzk","abilities": "['*']","lastUsedAt": "null","expiresAt": "2024-03-17T12:33:15.904Z"}}
   * @responseBody 400 - {"errors": [{ "message": "Invalid user credentials"}]}
   */
  async login({ request }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(payload.email, payload.password)

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

  /**
   * @passwordLost
   * @summary ask password lost return code by email
   * @requestBody {"email": "test@test.fr"}
   * @responseBody 200 - {"email send": true}
   * @returns
   */
  async passwordLost({ request }: HttpContext) {
    const payload = await request.validateUsing(lostPasswordValidator)
    const user = await User.query().where('email', payload.email)
    const oldReset = await ResetPassword.query().where('email', payload.email)

    let code = Math.floor(100000 + Math.random() * 900000)

    if (user.length === 1) {
      let email = await mail.send((message) => {
        message
          .to('alexandrechabane72@gmail.com')
          .from('boulderproblem@chabs.fr')
          .subject('Verify your email address')
          .htmlView('emails/reset_password', {
            title: 'Boulder Problem',
            code: code.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
          })
      })
      // delete old reset
      if (oldReset.length === 1) {
        const reset = await ResetPassword.findOrFail(oldReset[0].id)
        await reset.delete()
      }
      await ResetPassword.create({ user_id: user[0].id, code, email: payload.email })
    }

    return {
      email_send: true,
    }
  }

  /**
   * @resetPassword
   * @summary ask reset password
   * @requestBody {"email": "test@test.fr","code": "123456", "password": "test"}
   * @responseBody 200 - {"password_reset": true}
   * @responseBody 422 - Time exceeded, Wrong code, Form error
   * @returns
   */
  async resetPassword({ request, response }: HttpContext) {
    const payload = await request.validateUsing(resetPasswordValidator)

    const reset = await ResetPassword.query().where('email', payload.email)

    if (reset.length === 1) {
      if (reset[0].code === payload.code) {
        if (
          Interval.fromDateTimes(
            DateTime.fromISO(reset[0].createdAt.toString()),
            DateTime.now()
          ).length('minutes') < 5
        ) {
          // reset password
          const user = await User.query().where('email', payload.email)
          await user[0].merge({ ...{ password: payload.password } }).save()

          deleteRequest(reset[0].id)
          return {
            password_reset: true,
          }
        } else {
          deleteRequest(reset[0].id)
          response.status(422).send('Time exceeded')
          return
        }
        // delete request in table
      } else {
        response.status(422).send('Wrong code')
        return
      }
    } else {
      response.status(422).send('Form error')
      return
    }
  }

  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  async callback({ ally, auth, response }: HttpContext) {
    console.log('plop')

    const google = ally.use('google')
    console.log(google)

    if (google.accessDenied()) {
      console.log('Access denied')
      return response.unauthorized('Access denied')
    }

    if (google.stateMisMatch()) {
      console.log('State mismatch')
      return response.badRequest('State mismatch')
    }

    if (google.hasError()) {
      console.log('Error during authentication')
      console.log(google.getError())
      return response.badRequest(google.getError())
    }

    console.log('➡️ Avant récupération du profil Google')
    try {
      const user = await google.user()
      console.log('✅ Utilisateur Google :', user)

      // suite logique...
      return response.ok(user)
    } catch (error) {
      console.error('❌ Erreur google.user():', error)
      return response.internalServerError('Erreur Google OAuth')
    }

    const user = await this.findOrCreateUser(google)

    const token = await User.accessTokens.create(user)

    return response.redirect(`http://localhost:3000/login?token=${token}`)
  }

  private async findOrCreateUser(google) {
    const userInfo = await google.user()

    const existing = await User.findBy('email', userInfo.email)

    if (existing) return existing

    console.log(userInfo)

    const user = new User()
    user.email = userInfo.email
    user.avatar = userInfo.avatarUrl
    user.username = userInfo.name
    user.provider = 'google'
    await user.save()

    return user
  }
}

async function deleteRequest(id: number) {
  const post = await ResetPassword.findOrFail(id)
  await post.delete()
}
