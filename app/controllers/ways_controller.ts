import type { HttpContext } from '@adonisjs/core/http'
import Way from '#models/way'
import {
  commentWayValidator,
  createWayValidator,
  noteWayValidator,
  updateWayValidator,
  validWayValidator,
} from '#validators/way'
import { DateTime } from 'luxon'
import { assert } from '../utils.js'
import CommentsWay from '#models/comments_way'
import NotesWay from '#models/notes_way'
import ValidWay from '#models/valid_way'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import { promises as fs } from 'fs'
import sharp from 'sharp'

let imageRoute = `/home/node/app/build/uploads/posts/`
if (process.env.NODE_ENV !== 'production') {
  imageRoute = `./uploads/posts/`
}

export default class WaysController {
  async createWay({ request }: HttpContext) {
    let payload = await request.validateUsing(createWayValidator)
    let imageId
    if (payload.image) {
      // Décoder et sauvegarder l'image base64
      const base64Data = payload.image.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      const ext = payload.image.split(';')[0].split('/')[1] // extraire l'extension
      imageId = `${cuid()}.${ext}`
      const path = app.makePath('uploads/posts', imageId)

      // Créer le répertoire s'il n'existe pas
      await fs.mkdir(app.makePath('uploads/posts'), { recursive: true })
      await fs.writeFile(path, buffer)
    }

    // save way
    return await Way.create({
      wallId: payload.wallId,
      colorId: payload.colorId,
      difficultyId: payload.difficultyId,
      style: payload.style,
      routeSetter: payload.routeSetter,
      name: payload.name,
      image: imageId,
    })
  }

  async getWayId({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id

    return await Way.query()
      .preload('difficulty')
      .preload('color')
      .preload('notes', (query) => query.where('user_id', user_id).select('note'))
      .preload('valid', (query) => query.where('user_id', user_id))
      .withCount('comments', (query) => query.count('*').as('nbComments'))
      .withCount('avgnotes', (q) => q.avg('note').as('avg_note'))
      .where('id', request.params().id)
      .first()
  }

  async getWayImage({ request, response }: HttpContext) {
    let size = 500
    if (request.qs().size) {
      size = parseInt(request.qs().size)
    }
    let way = await Way.findOrFail(request.params().id)
    if (way.image) {
      const buffer = await sharp(imageRoute + way.image).resize(size)
      response.header('Content-Type', 'image/' + way.image.split('.')[1])
      return response.stream(buffer)
    } else {
      return response.status(422).send("nom de l'avatar incorrect")
    }
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
    let page = request.only(['page']).page
    if (!page) {
      page = 1
    }
    return await CommentsWay.query()
      .where('way_id', request.params().id)
      .preload('user', (profileQuery) => {
        profileQuery.select(['id', 'firstname', 'lastname', 'avatar'])
      })
      .orderBy('created_at', 'desc')
      .paginate(page, 10)
  }

  async createWayComment({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(commentWayValidator)
    return await CommentsWay.create({
      userId: auth.user.id,
      text: payload.text,
      wayId: request.params().id,
    })
  }

  async deleteWayComment({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    const comment = await CommentsWay.findOrFail(request.params().id_comment)
    if (comment.userId !== auth.user.id) {
      throw new Error('You are not allowed to delete this comment')
    }
    await comment.delete()
  }

  async createWayNote({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(noteWayValidator)

    // check if note already exists
    let noteExist = await NotesWay.query()
      .where('way_id', request.params().id)
      .andWhere('user_id', auth.user.id)
      .first()

    // if exists, update note
    if (noteExist) {
      let note = await noteExist.merge({ ...payload }).save()
      let avg = await NotesWay.query().where('way_id', request.params().id).avg('note').first()
      return { note, avgNote: avg?.avgNote }
    } else {
      let note = await NotesWay.create({
        user_id: auth.user.id,
        note: payload.note,
        way_id: request.params().id,
      })
      let avg = await NotesWay.query().where('way_id', request.params().id).avg('note').first()
      return { note, avgNote: avg?.avgNote }
    }
  }

  async createWayValid({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(validWayValidator)

    let validExist = await ValidWay.query()
      .where('wayId', request.params().id)
      .andWhere('user_id', auth.user.id)
      .first()
    if (payload.status === 'notvalid') {
      if (validExist) {
        return await validExist.delete()
      }
    } else {
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
}
