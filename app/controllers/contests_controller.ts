import type { HttpContext } from '@adonisjs/core/http'
import { assert } from '../utils.js'
import Contest from '#models/contest'
import { createContestValidator, updateContestValidator } from '#validators/contests'
import { userId } from '#models/user'
import { DateTime } from 'luxon'
import UsersContest from '#models/users_contest'
import Way from '#models/way'
import WaysContest from '#models/ways_contest'

export default class ContestsController {
  /**
   * @addContest
   * @summary add contest
   * @requestBody {"foo": "bar"}
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async addContest({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')

    let payload = await request.validateUsing(createContestValidator)
    if (auth.user.roleId === 1) {
      payload.user_id = auth.user.id
    }

    // save contest
    const contest = await Contest.create({
      userId: payload.user_id as userId,
      name: payload.name,
      status: 'waiting', // default status
      startDate: DateTime.fromJSDate(payload.start_date),
      endDate: DateTime.fromJSDate(payload.end_date),
    })

    return contest
  }

  async getMine({ auth }: HttpContext) {
    assert(auth.user, 'kindly login')
    return await Contest.query()
      .where('userId', auth.user.id)
      .withCount('follow', (query) => query.count('*').as('follow_count'))
      .orderBy('createdAt', 'desc')
  }
  /**
   * @getContests
   * @summary get all contests
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getContests({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let page = request.only(['page']).page
    if (!page) {
      page = 1
    }
    return await Contest.query()
      .withCount('follow', (query) => query.count('*').as('follow_count'))
      .where('userId', auth.user.id)
      .orWhere('status', 'valid')
      .orWhere('status', 'stopped')
      .orderBy('createdAt', 'desc')
      .paginate(page, 10)
  }

  async getContest({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    const contestId = request.params().id
    return await Contest.query()
      .withCount('follow', (query) => query.count('*').as('follow_count'))
      .andWhere('id', contestId)
      .firstOrFail()
  }

  /**
   * @updateContest
   * @summary update contest
   * @requestBody {"foo": "bar"}
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async updateContest({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    const contestId = request.params().id
    let payload = await request.validateUsing(updateContestValidator)

    // update contest
    const contest = await Contest.query()
      .where('userId', auth.user.id)
      .andWhere('id', contestId)
      .firstOrFail()

    contest.merge({ ...payload })

    await contest.save()
    return contest
  }

  /**
   * @deleteContest
   * @summary delete contest
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async deleteContest({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    const contestId = request.params().id
    const contest = await Contest.query()
      .where('userId', auth.user.id)
      .andWhere('id', contestId)
      .firstOrFail()
    await contest.delete()
    return { success: true }
  }

  async followContest({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    const contestId = request.params().id
    let user_id = auth.user.id

    // Check if the contest exists
    const contest = await Contest.query().where('id', contestId).firstOrFail()

    let follow = await UsersContest.query()
      .where('userId', user_id)
      .andWhere('contestId', contestId)

    if (follow.length === 0) {
      await UsersContest.create({
        userId: user_id,
        contestId: contestId,
      })
      return contest
    } else {
      await UsersContest.query().where('userId', user_id).andWhere('contestId', contestId).delete()
      return contest
    }
  }

  async getContestStats({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    const contestId = request.params().id

    // Check if the contest exists
    const contest = await Contest.query().where('id', contestId).firstOrFail()
    let followers = await UsersContest.query()
      .where('contest_id', contestId)
      .count('* as count')
      .first()

    console.log(followers)

    return {
      contest,
      followers: parseInt(followers?.$extras.count) || 0,
    }
  }
  /**
   * @getContestWays
   * @summary get all ways for a contest
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getContestWays({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    const contestId = request.params().id

    // Check if the contest exists
    await Contest.query().where('id', contestId).firstOrFail()

    // Fetch the ways associated with the contest
    const ways = await Way.query()
      .preload('difficulty')
      .preload('color')
      .preload('wall', (wallQuery) => {
        wallQuery.preload('zone', (zoneQuery) => {
          zoneQuery.preload('place')
        })
      })
      .join('ways_contests', 'ways.id', 'ways_contests.way_id')
      .where('ways_contests.contest_id', contestId)
      .select('ways.*') // important pour éviter les colonnes en double

    return ways
  }

  async addWayToContest({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    const contestId = request.params().id
    const wayId = request.params().wayId

    // Check if the contest exists
    await Contest.query().where('id', contestId).firstOrFail()

    // Check if the way exists
    await Way.query().where('id', wayId).firstOrFail()

    let ways_contest = await WaysContest.query()
      .where('way_id', wayId)
      .andWhere('contest_id', contestId)

    // Add the way to the contest
    if (ways_contest.length === 0) {
      await WaysContest.create({
        contest_id: contestId,
        way_id: wayId,
      })
    }
    return { success: true }
  }

  async removeWayFromContest({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    const contestId = request.params().id
    const wayId = request.params().wayId

    // Check if the contest exists
    await Contest.query().where('id', contestId).firstOrFail()

    // Check if the way exists
    await Way.query().where('id', wayId).firstOrFail()

    // Remove the way from the contest
    await WaysContest.query().where('contest_id', contestId).andWhere('way_id', wayId).delete()

    return { success: true }
  }

  async getContestUsers({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    const contestId = request.params().id

    // Check if the contest exists
    await Contest.query().where('id', contestId).firstOrFail()

    // Fetch the users associated with the contest
    const users = await UsersContest.query()
      .where('contest_id', contestId)
      .preload('user', (userQuery) => {
        userQuery.select('id', 'email', 'firstname', 'lastname', 'avatar')
      })

    return users.map((uc) => uc.user)
  }
}
