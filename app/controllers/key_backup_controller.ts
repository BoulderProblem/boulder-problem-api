import KeyBackups from '#models/key_backups'
import { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import User from '#models/user'

export default class KeyBackupsController {
  public async store({ request, auth }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id

    // const data = request.only(['ciphertext', 'nonce', 'salt'])
    const data = request.only(['priv', 'pub'])
    console.log(data)

    // save public key
    let user = await User.findOrFail(user_id)
    await user.merge({ ...{ publicKey: data.pub } }).save()

    // save private key
    const backup = await KeyBackups.updateOrCreate(
      { userId: auth.user!.id },
      { ...data.priv, userId: auth.user!.id }
    )
    return backup
  }

  public async show({ auth }: HttpContext) {
    const backup = await KeyBackups.query().where('user_id', auth.user!.id).first()
    return backup
  }
}
