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
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import sharp from 'sharp'
import Comment from '#models/comment'

let imageRoute = `/home/node/app/build/uploads/posts/`
if (process.env.NODE_ENV !== 'production') {
  imageRoute = `./uploads/posts/`
}

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
    for (const image of payload.images) {
      // create unique image name
      let imageName = `${cuid()}.${image.extname}`
      imageids.push(imageName)
      // save image
      image.move(app.makePath('uploads/posts'), {
        name: imageName,
      })
    }

    // save post
    const post = await Post.create({
      title: payload.title,
      text: payload.text,
      image: imageids,
      user_id: auth.user.id,
    })

    return post
  }

  /**
   * @updatePosts
   * @summary update post
   * @requestBody {"title": "title", "text": "coucou"}
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
   * @responseBody 401 - Wrong image name
   */
  async getImage({ request, response }: HttpContext) {
    let size = 500
    if (request.qs().size) {
      size = parseInt(request.qs().size)
    }
    let post = await Post.findOrFail(request.params().id)
    if (post.image.includes(request.params().id_image)) {
      const buffer = await sharp(imageRoute + request.params().id_image).resize(size)
      response.header('Content-Type', 'image/' + request.params().id_image.split('.')[1])
      return response.stream(buffer)
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
      .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
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
    if (auth.user.id === post.user_id) {
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
    let post_id = request.params().id
    let user_id = auth.user.id

    // check if post exist
    await Post.findOrFail(post_id)

    let like = await Like.query().where('post_id', post_id).andWhere('user_id', user_id)

    if (like.length === 0 && payload.like) {
      // create like
      await Like.create({ post_id, user_id })
      return await Post.query()
        .preload('user', (profileQuery) => {
          profileQuery.select(['id', 'firstname', 'lastname', 'avatar'])
        })
        .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
        .withCount('likes', (query) => query.count('*').as('likes_count'))
        .withCount('comments', (query) => query.count('*').as('comments_count'))
        .where('id', post_id)
        .first()
    } else if (like.length === 1 && !payload.like) {
      // unlike
      await Like.query().where('post_id', post_id).andWhere('user_id', user_id).delete()

      return await Post.query()
        .preload('user', (profileQuery) => {
          profileQuery.select(['id', 'firstname', 'lastname', 'avatar'])
        })
        .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
        .withCount('likes', (query) => query.count('*').as('likes_count'))
        .withCount('comments', (query) => query.count('*').as('comments_count'))
        .where('id', post_id)
        .first()
    } else {
      return await Post.query()
        .preload('user', (profileQuery) => {
          profileQuery.select(['id', 'firstname', 'lastname', 'avatar'])
        })
        .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
        .withCount('likes', (query) => query.count('*').as('likes_count'))
        .withCount('comments', (query) => query.count('*').as('comments_count'))
        .where('id', post_id)
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
    return await Comment.query()
      .where('post_id', post.id)
      .preload('user', (profileQuery) => {
        profileQuery.select(['id', 'firstname', 'lastname', 'avatar'])
      })
      .orderBy('created_at', 'desc')
  }

  /**
   * @createComment
   * @summary add comment to post
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async createComment({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(createCommentValidator)

    let post_id = request.params().id

    return await Comment.create({
      user_id: auth.user.id,
      text: payload.text,
      post_id: post_id,
    })
  }

  async deleteComment({ auth, request, response }: HttpContext) {
    assert(auth.user, 'kindly login')
    const comment = await Comment.findOrFail(request.params().id_comment)

    const user_id = comment.user_id
    const post_id = comment.post_id

    if (auth.user.id === comment.user_id) {
      await comment.delete()
      return await Post.query()
        .preload('user', (profileQuery) => {
          profileQuery.select(['id', 'firstname', 'lastname', 'avatar'])
        })
        .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
        .withCount('likes', (query) => query.count('*').as('likes_count'))
        .withCount('comments', (query) => query.count('*').as('comments_count'))
        .where('id', post_id)
    } else {
      response.status(401).send('Permission denied')
      return
    }
  }
}
