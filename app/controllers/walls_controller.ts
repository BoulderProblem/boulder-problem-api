import Wall from '#models/wall'
import Way from '#models/way'
import { createWallValidator } from '#validators/wall'
import type { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'

export default class WallsController {
  async createWall({ request }: HttpContext) {
    let payload = await request.validateUsing(createWallValidator)

    // save post
    return await Wall.create(payload)
  }

  async getWallId({ request }: HttpContext) {
    return await Wall.findOrFail(request.params().id)
  }

  async getWallWays({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id

    let way = await Way.query()
      .preload('difficulty')
      .preload('color')
      .preload('valid', (query) => query.where('user_id', user_id))
      .withCount('notes', (query) => query.avg('note').as('note'))
      .where('wall_id', request.params().id)
      .whereNull('delete_at')
      .orderBy('created_at', 'asc')
    return way
  }
}
