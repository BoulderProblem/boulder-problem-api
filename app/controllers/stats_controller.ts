import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class StatsController {
  /**
   * @getStats
   * @summary getStats
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getStats({}: HttpContext) {
    let res: any = {}
    res.users = (await db.from('users').countDistinct('id').where('role_id', 1))[0].count
    res.gerants = (await db.from('users').countDistinct('id').where('role_id', 2))[0].count
    res.posts = (await db.from('posts').countDistinct('id'))[0].count
    let graph_users = (
      await db.rawQuery(
        "SELECT date_trunc('day', created_at) AS day, COUNT(*) FROM users WHERE role_id = 1 GROUP BY date_trunc('day', created_at) ORDER BY Day DESC"
      )
    ).rows
    let graph_gerants = (
      await db.rawQuery(
        "SELECT date_trunc('day', created_at) AS day, COUNT(*) FROM users WHERE role_id = 2 GROUP BY date_trunc('day', created_at) ORDER BY Day DESC"
      )
    ).rows
    let graph_posts = (
      await db.rawQuery(
        "SELECT date_trunc('day', created_at) AS day, COUNT(*) FROM posts GROUP BY date_trunc('day', created_at) ORDER BY Day DESC"
      )
    ).rows

    var start = new Date()
    start.setDate(start.getDate() - 365)

    var daysOfYear = []
    const formatter = new Intl.DateTimeFormat('en-EN', { dateStyle: 'short' })
    for (var d = start; d <= new Date(); d.setDate(d.getDate() + 1)) {
      let count_users = graph_users.filter(
        (g: any) => new Date(new Date(d).toDateString()).getTime() === new Date(g.day).getTime()
      )[0]
      let count_gerants = graph_gerants.filter(
        (g: any) => new Date(new Date(d).toDateString()).getTime() === new Date(g.day).getTime()
      )[0]
      let count_posts = graph_posts.filter(
        (g: any) => new Date(new Date(d).toDateString()).getTime() === new Date(g.day).getTime()
      )[0]
      daysOfYear.push({
        date: formatter.format(new Date(d)),
        users: count_users ? parseInt(count_users.count) : 0,
        gerants: count_gerants ? parseInt(count_gerants.count) : 0,
        posts: count_posts ? parseInt(count_posts.count) : 0,
      })
    }

    res.daysOfYear = daysOfYear

    return res
  }
}
