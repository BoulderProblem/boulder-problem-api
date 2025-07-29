// import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import { loginValidator, lostPasswordValidator, resetPasswordValidator } from '#validators/auth'
import mail from '@adonisjs/mail/services/main'
import ResetPassword from '#models/reset_password'
import { cuid } from '@adonisjs/core/helpers'
import { DateTime, Interval } from 'luxon'
import axios from 'axios'
import fs from 'fs'
import env from '#start/env'

let imageRoute = `/home/node/app/build/uploads/users/`
if (process.env.NODE_ENV !== 'production') {
  imageRoute = `./uploads/users/`
}

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

  async callback({ ally, request, auth, response }: HttpContext) {
    const code = request.input('code')

    if (!code) {
      return response.badRequest('Missing ?code param')
    }

    try {
      // 1️⃣ Échanger le code contre un access token
      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', null, {
        params: {
          code,
          client_id: env.get('GOOGLE_CLIENT_ID'),
          client_secret: env.get('GOOGLE_CLIENT_SECRET'),
          redirect_uri: env.get('GOOGLE_CALLBACK_URL'),
          grant_type: 'authorization_code',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      const { access_token, id_token } = tokenRes.data

      // 2️⃣ Récupérer le profil utilisateur avec le token
      const userRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })

      const genderRes = await axios.get(
        'https://people.googleapis.com/v1/people/me?personFields=genders',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      console.log(genderRes.data)
      console.log('✅ Sexe:', genderRes.data)

      const userGoogle = userRes.data

      console.log('✅ Profil utilisateur Google :', userGoogle)
      const userCreate = await findOrCreateUser(userGoogle)
      const token = await User.accessTokens.create(userCreate)
      console.log('token')
      console.log(token)
      console.log(token.value)

      // return token
      return response.redirect(env.get('URL') + '/login?token=' + JSON.stringify(token))
    } catch (err) {
      console.error('❌ Erreur OAuth:', err.response?.data || err.message)
      return response.internalServerError('OAuth error')
    }
  }
}

async function findOrCreateUser(userGoogle: any) {
  const existing = await User.findBy('email', userGoogle.email)

  if (existing) return existing

  console.log(userGoogle)
  //save image

  let avatar = `${cuid()}.jpg`
  const response = await axios.get(userGoogle.picture, { responseType: 'arraybuffer' })

  await fs.writeFileSync(imageRoute + avatar, response.data)

  const user = new User()
  user.email = userGoogle.email
  user.avatar = avatar
  user.firstname = userGoogle.given_name
  user.lastname = userGoogle.family_name
  user.password = cuid() // Set a random password
  await user.save()

  return user
}

async function deleteRequest(id: number) {
  const post = await ResetPassword.findOrFail(id)
  await post.delete()
}
