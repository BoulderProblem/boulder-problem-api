import type { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import Post from '#models/post'
import {
  createCommentValidator,
  createPostValidator,
  likePostValidator,
  updatePostValidator,
} from '#validators/post'
import Like from '#models/like'

import FileService from '#services/FileService'
import { Readable } from 'stream'
import { DateTime } from 'luxon'
import fs from 'fs'
import Comment from '#models/comment'

const fileService = new FileService()

export default class PostsController {
  /**
   * @addPosts
   * @summary add post
   * @requestBody {"foo": "bar"}
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async addPosts({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(createPostValidator)
    let imageids: string[] = []
    if (!payload.images) {
      payload.images = []
    }
    if (payload.images.length === 0) {
      payload.images = []
    }
    if (typeof payload.images === 'string') {
      payload.images = [payload.images]
    }
    for (const image of payload.images) {
      // Décoder et sauvegarder l'image base64
      const buffer = fs.readFileSync(image.tmpPath!)
      const contentType = image.headers['content-type'] ?? 'image/jpeg'
      const extname = image.extname ?? contentType.split('/')[1] ?? 'jpg'
      const fileKey = await fileService.uploadFile(
        {
          buffer,
          extname,
          headers: { 'content-type': contentType },
        },
        'posts'
      )
      imageids.push(fileKey.split('/').pop() as string)
    }

    // save post
    const post = await Post.create({
      title: payload.title,
      text: payload.text,
      image: imageids,
      userId: auth.user.id,
      location: payload.location,
      startTime: payload.startTime,
      endTime: payload.endTime,
      activity: payload.activity,
      feeling: payload.feeling,
      privateNote: payload.privateNote,
      materials: payload.materials,
      visibility: payload.visibility,
    })

    return post
  }

  /**
   * @updatePosts
   * @summary update post
   * @requestBody {"title": "title", "text": "coucou"}
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async updatePosts({ auth, request, response }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(updatePostValidator)
    let post = await Post.findOrFail(request.params().id)

    if (post.userId === auth.user.id) {
      await post.merge({ ...payload, ...{ updatedAt: DateTime.local() } }).save()

      return await Post.findOrFail(request.params().id)
    } else {
      response.status(401).send('Permission denied')
      return
    }
  }

  /**
   * @getImage
   * @summary get post image
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   * @responseBody 401 - Wrong image name
   */
  async getImage({ request, response }: HttpContext) {
    let size = 500
    if (request.qs().size) {
      size = parseInt(request.qs().size)
    }
    let post = await Post.findOrFail(request.params().id)
    if (post.image.includes(request.params().id_image)) {
      const object = await fileService.getFile('posts/' + request.params().id_image)

      if (!object.Body) {
        return response.status(404).send('Not found')
      }

      // Headers importants
      response.header('Content-Type', object.ContentType || 'application/octet-stream')
      response.header('Content-Length', object.ContentLength?.toString() || '')
      response.header('Cache-Control', 'private, max-age=3600')

      return response.stream(object.Body as Readable)
    } else {
      response.status(422).send('Wrong image name')
      return
    }
  }

  /**
   * @getPostId
   * @summary get specific post
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getPostId({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id

    return await Post.query()
      .preload('user', (profileQuery) => {
        profileQuery.select(['id', 'firstname', 'lastname', 'avatar'])
      })
      .withCount('likes', (query) => query.count('*').as('is_like').where('userId', user_id))
      .withCount('likes', (query) => query.count('*').as('likes_count'))
      .withCount('comments', (query) => query.count('*').as('comments_count'))
      .where('id', request.params().id)
  }

  /**
   * @deletePostId
   * @summary delete specific post
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async deletePostId({ auth, request, response }: HttpContext) {
    assert(auth.user, 'kindly login')
    const post = await Post.findOrFail(request.params().id)
    if (auth.user.id === post.userId) {
      await post.delete()
      return { success: true }
    } else {
      response.status(401).send('Permission denied')
      return
    }
  }

  /**
   * @likePost
   * @summary like or unlike post
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async likePost({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(likePostValidator)
    let postId = request.params().id
    let userId = auth.user.id

    // check if post exist
    await Post.findOrFail(postId)

    let like = await Like.query().where('postId', postId).andWhere('userId', userId)

    if (like.length === 0 && payload.like) {
      // create like
      await Like.create({ postId: postId, userId: userId })
      return await Post.query()
        .preload('user', (profileQuery) => {
          profileQuery.select(['id', 'firstname', 'lastname', 'avatar'])
        })
        .withCount('likes', (query) => query.count('*').as('is_like').where('userId', userId))
        .withCount('likes', (query) => query.count('*').as('likes_count'))
        .withCount('comments', (query) => query.count('*').as('comments_count'))
        .where('id', postId)
        .first()
    } else if (like.length === 1 && !payload.like) {
      // unlike
      await Like.query().where('postId', postId).andWhere('userId', userId).delete()

      return await Post.query()
        .preload('user', (profileQuery) => {
          profileQuery.select(['id', 'firstname', 'lastname', 'avatar'])
        })
        .withCount('likes', (query) => query.count('*').as('is_like').where('userId', userId))
        .withCount('likes', (query) => query.count('*').as('likes_count'))
        .withCount('comments', (query) => query.count('*').as('comments_count'))
        .where('id', postId)
        .first()
    } else {
      return await Post.query()
        .preload('user', (profileQuery) => {
          profileQuery.select(['id', 'firstname', 'lastname', 'avatar'])
        })
        .withCount('likes', (query) => query.count('*').as('is_like').where('userId', userId))
        .withCount('likes', (query) => query.count('*').as('likes_count'))
        .withCount('comments', (query) => query.count('*').as('comments_count'))
        .where('id', postId)
        .first()
    }
  }

  /**
   * @getComments
   * @summary get post comments
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getComments({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    const post = await Post.findOrFail(request.params().id)
    let page = request.only(['page']).page
    if (!page) {
      page = 1
    }
    return await Comment.query()
      .where('postId', post.id)
      .preload('user', (profileQuery) => {
        profileQuery.select(['id', 'firstname', 'lastname', 'avatar'])
      })
      .orderBy('created_at', 'desc')
      .paginate(page, 10)
  }

  /**
   * @createComment
   * @summary add comment to post
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async createComment({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(createCommentValidator)

    let postId = request.params().id

    return await Comment.create({
      userId: auth.user.id,
      text: payload.text,
      postId: postId,
    })
  }

  async deleteComment({ auth, request, response }: HttpContext) {
    assert(auth.user, 'kindly login')
    const comment = await Comment.findOrFail(request.params().id_comment)

    const userId = comment.userId
    const postId = comment.postId

    if (auth.user.id === userId) {
      await comment.delete()
      return await Post.query()
        .preload('user', (profileQuery) => {
          profileQuery.select(['id', 'firstname', 'lastname', 'avatar'])
        })
        .withCount('likes', (query) => query.count('*').as('is_like').where('userId', userId))
        .withCount('likes', (query) => query.count('*').as('likes_count'))
        .withCount('comments', (query) => query.count('*').as('comments_count'))
        .where('id', postId)
    } else {
      response.status(401).send('Permission denied')
      return
    }
  }
}
