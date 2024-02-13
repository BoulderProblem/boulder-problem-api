import type { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import Post from '#models/post'
import { createPostValidator, updatePostValidator } from '#validators/post'
import Like from '#models/like'

export default class PostsController {
  /**
   *
   * @param param0
   * @returns all posts
   */
  async getPosts({ auth }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id

    return await Post.query()
      .preload('user')
      .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
      .withCount('likes', (query) => query.count('*').as('likes_count'))
      .where('user_id', user_id)
  }

  /**
   *
   * @param param0
   * @returns return added post
   */
  async addPosts({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(createPostValidator)

    const post = await Post.create({
      ...payload,
      ...{ user_id: auth.user.id },
    })

    return post
  }

  /**
   *
   * @param param0
   * @returns updated post
   */
  async updatePosts({ request }: HttpContext) {
    let payload = await request.validateUsing(updatePostValidator)
    let post = await Post.findOrFail(request.params().id)
    await post.merge(payload).save()

    return post
  }

  /**
   *
   * @param param0
   * @returns post
   */
  async getPostId({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id

    return await Post.query()
      .preload('user')
      .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
      .withCount('likes', (query) => query.count('*').as('likes_count'))
      .where('id', request.params().id)
  }

  /**
   *
   * @param param0
   * @returns
   */
  async deletePostId({ request }: HttpContext) {
    const post = await Post.findOrFail(request.params().id)

    await post.delete()
    return { success: true }
  }

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
}
