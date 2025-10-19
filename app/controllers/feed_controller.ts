import type { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import Post from '#models/post'
import { DateTime } from 'luxon'
import Follow from '#models/follow'

export default class FeedController {
  /**
   * @getFeed
   * @summary get feed
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getFeed({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id
    let page = request.only(['page']).page
    if (!page) {
      page = 1
    }

    // get followers
    const followingUsers = await Follow.query().where('user_follower_id', user_id)

    let following_id = followingUsers.map((f: any) => f.user_following_id)
    following_id.push(user_id)

    let posts = await Post.query()
      .preload('user', (profileQuery) => {
        profileQuery.select(['firstname', 'lastname', 'avatar'])
      })
      .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
      .withCount('likes', (query) => query.count('*').as('likes_count'))
      .withCount('comments', (query) => query.count('*').as('comments_count'))
      .whereIn('user_id', following_id)

    const scoredPosts = posts
      .map((post) => ({
        ...transformPost(post),
        score: computeScore(post), // ta fonction perso
      }))
      .sort((a: any, b: any) => b.score - a.score)

    const perPage = 10

    const paginated = scoredPosts.slice((page - 1) * perPage, page * perPage)

    return {
      meta: {
        page,
        perPage,
        total: scoredPosts.length,
        lastPage: Math.ceil(scoredPosts.length / perPage),
      },
      data: paginated,
    }
  }
}

function transformPost(post: any) {
  // Accès aux attributs du modèle Lucid
  const {
    id,
    user_id,
    title,
    image,
    text,
    createdAt,
    updatedAt,
    likes_count,
    comments_count,
    is_like,
    score,
  } = post.$attributes

  // Si l'on veut aussi intégrer les données de l'utilisateur (comme le prénom et l'avatar)
  const user = post.$preloaded.user ? post.$preloaded.user : {}

  // Format transformé que l'on retourne
  return {
    id,
    userId: user_id,
    title,
    image,
    text,
    createdAt,
    updatedAt,
    likesCount: parseInt(likes_count, 10),
    commentsCount: parseInt(comments_count, 10),
    isLike: parseInt(is_like, 10) !== 0,
    score,
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      avatar: user.avatar,
    },
  }
}

function computeScore(post: any) {
  const now = DateTime.now()

  // Fraîcheur : plus c’est récent, plus c’est important
  const hoursSincePost = Math.max(1, now.diff(post.createdAt, 'hours').hours)

  // Poids des différents facteurs
  const weights = {
    like: 3,
    comment: 5,
    // readPenalty: -10,
    freshnessBoost: 10,
  }

  const freshnessScore = weights.freshnessBoost / hoursSincePost

  const score =
    (post.likesCount || 0) * weights.like +
    (post.commentsCount || 0) * weights.comment +
    freshnessScore

  return score
}
