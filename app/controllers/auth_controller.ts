import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import { loginValidator, lostPasswordValidator, resetPasswordValidator } from '#validators/auth'
import ResetPassword from '#models/reset_password'
import { cuid } from '@adonisjs/core/helpers'
import { DateTime, Interval } from 'luxon'
import axios from 'axios'
import fs from 'fs'
import env from '#start/env'
import ResetPasswordMailer from '../mailers/resetPassword.js'
import { createUserValidator } from '#validators/user'
import KeyBackups from '#models/key_backups'
import Firebase from '#services/firebase'
import { decryptPrivateKey, encryptPrivateKey } from '#services/crypto'

let imageRoute = `/home/node/app/build/uploads/users/`
if (process.env.NODE_ENV !== 'production') {
  imageRoute = `./uploads/users/`
}

export default class AuthController {
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

    return {
      ...token.toJSON(),
      pubSrvKey: env.get('SERVER_MASTER_PUBLIC_KEY'),
      userId: user.id,
      firstLogin: true,
    }
  }

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

    return {
      ...token.toJSON(),
      pubSrvKey: env.get('SERVER_MASTER_PUBLIC_KEY'),
      userId: user.id,
      firstLogin: false,
    }
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

  async srvKey({}: HttpContext) {
    return {
      pubSrvKey: env.get('SERVER_MASTER_PUBLIC_KEY'),
    }
  }

  /**
   * @forgotPassword
   * @summary ask password lost return code by email
   * @requestBody {"email": "test@test.fr"}
   * @responseBody 200 - {"email send": true}
   * @returns
   */
  async forgotPassword({ request }: HttpContext) {
    const payload = await request.validateUsing(lostPasswordValidator)
    const user = await User.query().where('email', payload.email)
    const oldReset = await ResetPassword.query().where('email', payload.email)

    let code = Math.floor(100000 + Math.random() * 900000)

    if (user.length === 1) {
      if (user[0].firebase) {
        return {
          email_send: true,
        }
      }
      await new ResetPasswordMailer(user[0].email, user[0].firstname, code.toString()).sendNow()

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
          ).length('minutes') < 15
        ) {
          // reset password
          const user = await User.query().where('email', payload.email)
          await user[0].merge({ ...{ password: payload.password } }).save()

          deleteRequest(reset[0].id)

          // change encrypt key for user key backup
          const backup = await KeyBackups.query().where('user_id', user[0].id).first()
          if (backup) {
            let key = {
              ciphertext: backup.ciphertext_srv,
              nonce: backup.nonce_srv,
              salt: backup.salt_srv,
            }
            let userPriv = await decryptPrivateKey(
              key,
              env.get('SERVER_MASTER_PRIVATE_KEY') as string
            )

            // re-encrypt with user password
            const newKey = await encryptPrivateKey(userPriv, payload.password)

            await KeyBackups.query().where('user_id', user[0].id).update({
              ciphertext: newKey.ciphertext,
              nonce: newKey.nonce,
              salt: newKey.salt,
            })
          }
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

  async storePrivateKey({ request, auth }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id

    const data = request.only(['priv', 'privSrv', 'pub'])

    // save public key
    let user = await User.findOrFail(user_id)
    await user.merge({ ...{ publicKey: data.pub } }).save()

    // save private key
    await KeyBackups.updateOrCreate(
      { userId: auth.user!.id },
      {
        ciphertext: data.priv.ciphertext,
        nonce: data.priv.nonce,
        salt: data.priv.salt,
        ciphertext_srv: data.privSrv.ciphertext,
        nonce_srv: data.privSrv.nonce,
        salt_srv: data.privSrv.salt,
        userId: auth.user!.id,
      }
    )
    return { save: true }
  }

  async showPrivateKey({ auth }: HttpContext) {
    const backup = await KeyBackups.query()
      .where('user_id', auth.user!.id)
      .select('ciphertext', 'nonce', 'salt')
      .first()

    return backup
  }

  async firebaseLogin({ request, response }: HttpContext) {
    const idToken = request.header('Authorization')?.replace('Bearer ', '')
    let firstLogin = false
    if (!idToken) {
      return response.unauthorized({ error: 'Token manquant' })
    }

    try {
      // Vérifier le token Firebase
      let decoded = await Firebase.auth().verifyIdToken(idToken)

      const userRecord = await Firebase.auth().getUser(decoded.uid)

      if (!decoded.picture && userRecord.providerData[0] && userRecord.providerData[0].photoURL) {
        decoded.picture = userRecord.providerData[0].photoURL
      }

      if (!decoded.email) {
        return response.unauthorized({ error: 'Token Firebase invalide' })
      }
      // Vérifier si l'utilisateur existe dans ta DB
      let user = await User.query().where('email', decoded.email).first()

      if (!user) {
        firstLogin = true
        // Création du user dans Adonis
        let avatar
        if (decoded.picture) {
          avatar = `${cuid()}.jpg`
          const response = await axios.get(decoded.picture, { responseType: 'arraybuffer' })
          await fs.writeFileSync(imageRoute + avatar, response.data)
        }
        user = await User.create({
          email: decoded.email,
          firebase: true,
          firstname: decoded.name.split(' ')[0],
          lastname: decoded.name.split(' ')[1],
          avatar: avatar,
          password: cuid(), // Set a random password
        })
      }

      if (!user.firebase) {
        // user is create from adonis refuse firebase user
        return response.unauthorized({ error: "User don't exist for firebase" })
      }

      // Générer le token interne d'Adonis
      const token = await User.accessTokens.create(user)

      return {
        ...token.toJSON(),
        pubSrvKey: env.get('SERVER_MASTER_PUBLIC_KEY'),
        userId: user.id,
        firstLogin,
      }
    } catch (error) {
      console.log(error)
      return response.unauthorized({ error: 'Token Firebase invalide' })
    }
  }
}

async function deleteRequest(id: number) {
  const post = await ResetPassword.findOrFail(id)
  await post.delete()
}
