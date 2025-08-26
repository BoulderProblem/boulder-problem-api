import type { HttpContext } from '@adonisjs/core/http'
import Way from '#models/way'
import {
  createWayCommentValidator,
  createWayNoteValidator,
  createWayValidator,
  createWayValidValidator,
  updateWayValidator,
} from '#validators/way'
import { DateTime } from 'luxon'
import { assert } from '../utils.js'
import CommentsWay from '#models/comments_way'
import NotesWay from '#models/notes_way'
import ValidWay from '#models/valid_way'

export default class WaysController {
  async createWay({ request }: HttpContext) {
    let payload = await request.validateUsing(createWayValidator)

    // save way
    return await Way.create(payload)
  }

  async getWayId({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id

    return await Way.query()
      .preload('difficulty')
      .preload('color')
      .preload('valid', (query) => query.where('user_id', user_id))
      .withCount('notes', (query) => query.avg('note').as('note'))
      .where('id', request.params().id)
      .first()
  }

  async updateWayId({ request }: HttpContext) {
    let payload = await request.validateUsing(updateWayValidator)
    let way = await Way.findOrFail(request.params().id)

    // save way
    await way.merge({ ...payload }).save()

    return await Way.query()
      .preload('difficulty')
      .preload('color')
      .where('id', request.params().id)
      .firstOrFail()
  }

  async disableWayId({ request }: HttpContext) {
    let way = await Way.findOrFail(request.params().id)
    // disable way
    await way.merge({ ...{ deleteAt: DateTime.local() } }).save()

    return await Way.query()
      .preload('difficulty')
      .preload('color')
      .where('id', request.params().id)
      .firstOrFail()
  }

  async getWayComments({ request }: HttpContext) {
    return await CommentsWay.query()
      .where('way_id', request.params().id)
      .preload('user', (profileQuery) => {
        profileQuery.select(['id', 'firstname', 'lastname', 'avatar'])
      })
      .orderBy('created_at', 'desc')
  }

  async createWayComment({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(createWayCommentValidator)
    return await CommentsWay.create({
      user_id: auth.user.id,
      text: payload.text,
      way_id: request.params().id,
    })
  }

  async deleteWayComment({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    const comment = await CommentsWay.findOrFail(request.params().id_comment)
    if (comment.user_id !== auth.user.id) {
      throw new Error('You are not allowed to delete this comment')
    }
    await comment.delete()
  }

  async createWayNote({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(createWayNoteValidator)
    return await NotesWay.create({
      user_id: auth.user.id,
      note: payload.note,
      way_id: request.params().id,
    })
  }

  async createWayValid({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(createWayValidValidator)

    let validExist = await ValidWay.query()
      .where('wayId', request.params().id)
      .andWhere('user_id', auth.user.id)
      .first()

    if (validExist) {
      return await validExist.merge({ ...payload }).save()
    } else {
      return await ValidWay.create({
        user_id: auth.user.id,
        status: payload.status,
        wayId: request.params().id,
      })
    }
  }
}
