import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'

export default class UsersController {
  async GetUsers({ auth }: HttpContext) {
    assert(auth.user, 'kindly login')
    return await User.query()
  }

  async updateUsers({ auth }: HttpContext) {
    assert(auth.user, 'kindly login')
    return 'a'
  }

  async GetUserId({ request }: HttpContext) {
    return await User.findOrFail(request.params().id)
  }
}
