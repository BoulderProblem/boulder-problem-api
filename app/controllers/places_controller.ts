// import type { HttpContext } from '@adonisjs/core/http'

import Place from '#models/place'
import { HttpContext } from '@adonisjs/core/http'
import nodeFetch from 'node-fetch'
import { parseString } from 'xml2js'
import db from '@adonisjs/lucid/services/db'
import assert from 'assert'
import fs from 'fs'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { addPlanValidator } from '#validators/place'
import FavoritePlace from '#models/favorite_place'

export default class PlacesController {
  async places({ request }: HttpContext) {
    let search = request.only(['search']).search

    return await Place.query()
      .select('id', 'name', 'city', 'address')
      .whereILike('city', '%' + search + '%')
      .orWhereILike('name', '%' + search + '%')
      .orWhereILike('address', '%' + search + '%')
  }

  /**
   * @getPlan
   * @summary get place plan
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   * @responseBody 401 - Wrong image name
   */
  async getPlan({ request, response }: HttpContext) {
    let place = await Place.findOrFail(request.params().id)
    console.log(place.plan)
    console.log(request.params())

    if (place.plan.includes(request.params().id_plan)) {
      const image = fs.createReadStream('uploads/plans/' + request.params().id_plan)
      response.stream(image)
    } else {
      response.status(422).send('Wrong plan name')
      return
    }
  }

  /**
   * @getPlaceId
   * @summary get specific place
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getPlaceId({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id

    return await Place.query()
      .withCount('favorite', (query) =>
        query.count('*').as('is_favorite').where('user_id', user_id)
      )
      .withCount('favorite', (query) => query.count('*').as('favorite_count'))
      .where('id', request.params().id)
  }

  /**
   * @addPlanPlaceId
   * @summary add plan for place
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async addPlanPlaceId({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(addPlanValidator)
    let place = await Place.findOrFail(request.params().id)

    // create unique image name
    let planName = `${cuid()}.${payload.plan.extname}`
    // save image
    payload.plan.move(app.makePath('uploads/plans'), {
      name: planName,
    })

    if (place.plan) {
      place.plan.push(planName)
    } else {
      place.plan = [planName]
    }
    await place.save()

    return place
  }

  /**
   * @favoritePlace
   * @summary favorite or unfavorite place
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async favoritePlace({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let place_id = request.params().id
    let user_id = auth.user.id

    // check if place exist
    await Place.findOrFail(place_id)

    let favorite = await FavoritePlace.query()
      .where('place_id', place_id)
      .andWhere('user_id', user_id)

    if (favorite.length === 0) {
      // create favorite
      await FavoritePlace.create({ place_id, user_id })
      return await Place.query()
        .withCount('favorite', (query) =>
          query.count('*').as('is_favorite').where('user_id', user_id)
        )
        .withCount('favorite', (query) => query.count('*').as('favorite_count'))
        .where('id', place_id)
    } else {
      // unfavorite
      await FavoritePlace.query().where('place_id', place_id).andWhere('user_id', user_id).delete()

      return await Place.query()
        .withCount('favorite', (query) =>
          query.count('*').as('is_favorite').where('user_id', user_id)
        )
        .withCount('favorite', (query) => query.count('*').as('favorite_count'))
        .where('id', place_id)
    }
  }

  /**
   * @load
   * @summary login user
   */
  async load({ request }: HttpContext) {
    let url = 'http://www.overpass-api.de/api/interpreter?data='

    url += `area["name:fr"="France"]['admin_level'='2']->.country;(node [sport=climbing](area.country););(._;>;); out geom;`
    let tags: any = []

    await nodeFetch(url)
      .then((response) => response.text())
      .then((data) => {
        parseString(data, async function (err: any, result: any) {
          // console.log(result.osm.node[0])
          // console.log(result.osm.node[0].tag)

          for (const node of result.osm.node) {
            const point = new Place()
            node.tag.forEach((element: any) => {
              if (element['$'].k === 'leisure') {
                point.sport_center = element['$'].v === 'sports_centre'
              }
              if (element['$'].k === 'name') {
                point.name = element['$'].v
              }
              if (element['$'].k === 'opening_hours') {
                point.hours = element['$'].v
              }
              if (element['$'].k === 'phone') {
                point.phone = element['$'].v
              }
              if (element['$'].k === 'website') {
                point.website = element['$'].v
              }
              if (element['$'].k === 'addr:city') {
                point.city = element['$'].v
              }
              if (element['$'].k === 'addr:postcode') {
                point.postal_code = element['$'].v
              }
              if (element['$'].k === 'addr:housenumber') {
                point.address = element['$'].v + ' '
              }
              if (element['$'].k === 'addr:street') {
                point.address += element['$'].v
              }
              if (element['$'].k === 'outdoor') {
                point.outdoor = element['$'].v === 'yes'
              }
              if (element['$'].k === 'climbing:grade:french:max') {
                point.grade_max = element['$'].v
              }
              if (element['$'].k === 'climbing:grade:french:min') {
                point.grade_min = element['$'].v
              }
              if (element['$'].k === 'climbing:length') {
                point.length_max = element['$'].v
                point.length_min = element['$'].v
              }
              if (element['$'].k === 'climbing:length:max') {
                point.length_max = element['$'].v
              }
              if (element['$'].k === 'climbing:length:min') {
                point.length_min = element['$'].v
              }
              if (element['$'].k === 'climbing:routes') {
                point.routes = element['$'].v
              }
            })

            // const point = new Place()
            point.osm_id = node['$'].id
            point.coordinate = node['$'].lon + ',' + node['$'].lat
            point.geocoordinate = db
              .st()
              .geomFromText('SRID=4326;POINT(' + node['$'].lon + ' ' + node['$'].lat + ')')
            await point.save()
            // console.log(node['$'].lon + ',' + node['$'].lat)
            // console.log('SRID=4326;POINT(' + node['$'].lon + ' ' + node['$'].lat + ')')

            //   node.tag.forEach((element) => {
            //     if (!tags.find((tag) => tag === element['$'].k)) {
            //       tags.push(element['$'].k)
            //     }
            //     if (element['$'].k === 'name') {
            //       // console.log(element['$'].v)
            //     }
            //   })
          }
          // console.log(result.osm.node.length)

          // console.log(place)
        })
      })
    console.log('b')
    return 'plop'
  }
}
