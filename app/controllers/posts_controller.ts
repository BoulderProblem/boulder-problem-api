import type { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import Post from '#models/post'
import { createCommentValidator, createPostValidator, updatePostValidator } from '#validators/post'
import Like from '#models/like'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import fs from 'fs'
import Comment from '#models/comment'

export default class PostsController {
  /**
   * @getPosts
   * @summary get all user posts
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getPosts({ auth }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id

    return await Post.query()
      .preload('comments', (comments) => {
        comments.preload('user')
      })
      .preload('user')
      .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
      .withCount('likes', (query) => query.count('*').as('likes_count'))
      .where('user_id', user_id)
  }

  /**
   * @addPosts
   * @summary add post
   * @requestBody {"foo": "bar"}
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async addPosts({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(createPostValidator)

    // create unique image name
    let imageName = `${cuid()}.${payload.image.extname}`

    // save image
    await payload.image.move(app.makePath('uploads/posts'), {
      name: imageName,
    })

    // save post
    const post = await Post.create({
      title: payload.title,
      text: payload.text,
      image: imageName,
      user_id: auth.user.id,
    })

    return post
  }

  /**
   * @addPosts
   * @summary add post
   * @requestBody {"foo": "bar"}
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async updatePosts({ request }: HttpContext) {
    let payload = await request.validateUsing(updatePostValidator)
    let post = await Post.findOrFail(request.params().id)

    await post.merge({ ...payload, ...{ updatedAt: DateTime.local() } }).save()

    return await Post.findOrFail(request.params().id)
  }

  /**
   * @getImage
   * @summary get post image
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getImage({ request, response }: HttpContext) {
    let post = await Post.findOrFail(request.params().id)
    const image = fs.createReadStream('./uploads/posts/' + post.image)
    response.stream(image)
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
      // .preload('user')
      .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
      .withCount('likes', (query) => query.count('*').as('likes_count'))
      .where('id', request.params().id)
  }

  /**
   * @deletePostId
   * @summary delete specific post
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async deletePostId({ request }: HttpContext) {
    const post = await Post.findOrFail(request.params().id)

    await post.delete()
    return { success: true }
  }

  /**
   * @likePost
   * @summary like or unlike post
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async likePost({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let post_id = request.params().id
    let user_id = auth.user.id

    // check if post exist
    await Post.findOrFail(post_id)

    let like = await Like.query().where('post_id', post_id).andWhere('user_id', user_id)
    console.log(like.length)

    if (like.length === 0) {
      // create like
      await Like.create({ post_id, user_id })
      return await Post.query()
        .preload('user')
        .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
        .withCount('likes', (query) => query.count('*').as('likes_count'))
        .where('id', post_id)
    } else {
      // unlike
      await Like.query().where('post_id', post_id).andWhere('user_id', user_id).delete()

      return await Post.query()
        .preload('user')
        .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
        .withCount('likes', (query) => query.count('*').as('likes_count'))
        .where('id', post_id)
    }
  }

  /**
   * @createComment
   * @summary add comment to post
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async createComment({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(createCommentValidator)

    await Comment.create({
      user_id: auth.user.id,
      text: payload.text,
      post_id: request.params().id,
    })
  }
}
