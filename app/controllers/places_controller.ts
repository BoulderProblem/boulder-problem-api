// import type { HttpContext } from '@adonisjs/core/http'

import Place from '#models/place'
import { HttpContext } from '@adonisjs/core/http'
import nodeFetch from 'node-fetch'
import { parseString } from 'xml2js'
import db from '@adonisjs/lucid/services/db'
import assert from 'assert'
import FavoritePlace from '#models/favorite_place'
import Zone from '#models/zone'
import { cuid } from '@adonisjs/core/helpers'
import { favoritePlaceValidator, updatePlaceValidator } from '#validators/place'
import app from '@adonisjs/core/services/app'
import sharp from 'sharp'
import User from '#models/user'
import axios from 'axios'
import fs from 'fs'
import UserPlace from '#models/user_place'

const osmHeaders = {
  Authorization: 'Bearer F3m7iKmSgejTFepceqPyyyS1Knqj5MIUBhqn68NLAmU',
  Cookie: '_osm_totp_token=708664',
}

let imageRoute = `/home/node/app/build/uploads/places/`
if (process.env.NODE_ENV !== 'production') {
  imageRoute = `./uploads/places/`
}

const correspondance = [
  { name: 'hours', osm_name: 'opening_hours' },
  { name: 'name', osm_name: 'name' },
  { name: 'phone', osm_name: 'phone' },
  { name: 'website', osm_name: 'website' },
  { name: 'city', osm_name: 'addr:city' },
  { name: 'houseNumber', osm_name: 'addr:housenumber' },
  { name: 'postalCode', osm_name: 'addr:postcode' },
  { name: 'street', osm_name: 'addr:street' },
  { name: 'outdoor', osm_name: 'outdoor' },
  { name: 'gradeMax', osm_name: 'climbing:grade:french:max' },
  { name: 'gradeMin', osm_name: 'climbing:grade:french:min' },
  { name: 'lengthMin', osm_name: 'climbing:length:min' },
  { name: 'lengthMax', osm_name: 'climbing:length:max' },
  { name: 'routes', osm_name: 'climbing:routes' },
]

export default class PlacesController {
  async places({ auth, request }: HttpContext) {
    let search = request.only(['search']).search
    let page = request.only(['page']).page
    if (!page) {
      page = 1
    }

    assert(auth.user, 'kindly login')
    let user_id = auth.user.id

    let res: any = await Place.query()
      .select('id', 'name', 'city', 'address', 'logo')
      .withCount('favorite', (query) =>
        query.count('*').as('is_favorite').where('user_id', user_id)
      )
      .whereILike('city', '%' + search + '%')
      .orWhereILike('name', '%' + search + '%')
      .orWhereILike('address', '%' + search + '%')
      .orderBy('is_favorite', 'desc')
      .paginate(page, 10)
    return res
  }

  /**
   * @getMine
   * @summary get my places
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getMine({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id
    return await Place.query()
      .join('user_places', 'places.id', 'user_places.place_id')
      .where('user_places.user_id', user_id)
      .preload('owners', (query) => {
        query.select('id', 'firstname', 'lastname') // Sélectionner seulement la colonne 'bio' pour la relation 'profile'
      })
      .withCount('favorite', (query) =>
        query.count('*').as('is_favorite').where('user_id', user_id)
      )
      .withCount('favorite', (query) => query.count('*').as('favorite_count'))
  }

  async getFavorites({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id
    return await Place.query()
      .preload('owners', (query) => {
        query.select('id', 'firstname', 'lastname') // Sélectionner seulement la colonne 'bio' pour la relation 'profile'
      })
      .withCount('favorite', (query) =>
        query.count('*').as('is_favorite').where('user_id', user_id)
      )
      .withCount('favorite', (query) => query.count('*').as('favorite_count'))
      .whereHas('favorite', (query) => {
        query.where('user_id', user_id) // Utilisez 'user_id' au lieu de 'userId'
      })
  }
  /**
   * @getPlaceId
   * @summary get specific place
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getPlaceId({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_id = auth.user.id

    if (auth.user.roleId === 1) {
      return await Place.query()
        .withCount('favorite', (query) =>
          query.count('*').as('is_favorite').where('user_id', user_id)
        )
        .withCount('favorite', (query) => query.count('*').as('favorite_count'))
        .where('id', request.params().id)
        .first()
    } else {
      return await Place.query()
        .preload('owners', (query) => {
          query.select('id', 'firstname', 'lastname', 'email')
        })
        .withCount('favorite', (query) =>
          query.count('*').as('is_favorite').where('user_id', user_id)
        )
        .withCount('favorite', (query) => query.count('*').as('favorite_count'))
        .where('id', request.params().id)
        .first()
    }
  }

  /**
   * @getLogo
   * @summary get place logo
   * @responseBody 200 - image 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getLogo({ request, response }: HttpContext) {
    let place = await Place.findOrFail(request.params().id)
    let size = 500
    if (request.qs().size) {
      size = parseInt(request.qs().size)
    }

    if (place.logo) {
      const image = await sharp(imageRoute + place.logo).resize(size)
      return response.stream(image)
    } else {
      response.status(422).send('Logo non existant')
      return
    }
  }

  async getPlaceZones({ auth, request }: HttpContext) {
    return await Zone.query().where('place_id', request.params().id).orderBy('created_at', 'asc')
  }

  async getPlaceAllways({ auth, request }: HttpContext) {
    return await Zone.query()
      .where('place_id', request.params().id)
      .preload('walls', (wallQuery) => {
        wallQuery.preload('ways', (wayQuery) => {
          wayQuery.preload('difficulty').preload('color')
        })
      })
      .orderBy('created_at', 'asc')
  }

  async updatePlaceId({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let user_role = auth.user.roleId

    let payload = await request.validateUsing(updatePlaceValidator)
    let place = await Place.findOrFail(request.params().id)
    let placeUsers = await UserPlace.query().where('place_id', request.params().id)
    let usersId = placeUsers.map((userPlace) => userPlace.userId)

    if (typeof payload.coordinate === 'string')
      for (let [key, value] of Object.entries(payload)) {
        if (key !== 'image') payload[key] = JSON.parse(value)
      }
    payload.geocoordinate = db
      .st()
      .geomFromText('SRID=4326;POINT(' + payload.coordinate.x + ' ' + payload.coordinate.y + ')')
    payload.coordinate = payload.coordinate.x + ',' + payload.coordinate.y

    let exclude = ['coordinate', 'owners', 'geocoordinate']
    let updateData = []
    for (let [key, value] of Object.entries(payload)) {
      if (place[key] !== value && !exclude.includes(key)) {
        if (correspondance.filter((corr) => corr.name === key).length > 0) {
          key = correspondance.filter((corr) => corr.name === key)[0].osm_name
          updateData.push({ key, value })
        }
      }
    }

    // save image
    if (payload.image) {
      if (place.logo) {
        // delete old image
        fs.rmSync(imageRoute + place.logo)
      }
      // create unique image name
      payload.logo = `${cuid()}.${payload.image.extname}`
      // save image
      payload.image.move(app.makePath('uploads/places'), {
        name: payload.logo,
      })
      delete payload.image
    }

    // if add owner to place
    if (user_role === 3 && payload.owners && usersId !== payload.owners) {
      payload.owners = payload.owners.map((userPlace) => userPlace.id)
      // delete old owner
      usersId.forEach(async (ownerId) => {
        if (payload.owners && payload.owners.includes(ownerId)) return
        await UserPlace.query()
          .where('placeId', request.params().id)
          .andWhere('userId', ownerId)
          .delete()
      })
      // add owner to place
      payload.owners.forEach(async (ownerId) => {
        if (usersId.includes(ownerId)) return
        await UserPlace.create({
          placeId: request.params().id,
          userId: ownerId,
        })

        // change user role if place owner
        let user = await User.findOrFail(ownerId)
        if (user.roleId === 1) {
          await user.merge({ ...{ roleId: 2 } }).save()
        }
      })
    }

    await place.merge({ ...payload }).save()

    let updated_place = await Place.findOrFail(request.params().id)
    if (updateData.length > 0) {
      updateOSM(updated_place, updateData)
    }
    return updated_place
  }

  /**
   * @favoritePlace
   * @summary favorite or unfavorite place
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async favoritePlace({ auth, request }: HttpContext) {
    assert(auth.user, 'kindly login')
    let payload = await request.validateUsing(favoritePlaceValidator)
    let place_id = request.params().id
    let user_id = auth.user.id

    // check if place exist
    await Place.findOrFail(place_id)

    let favorite = await FavoritePlace.query()
      .where('place_id', place_id)
      .andWhere('user_id', user_id)

    // create favorite
    if (favorite.length === 0 && payload.favorite) {
      await FavoritePlace.create({ place_id, user_id })
    }

    // unfavorite
    if (favorite.length === 1 && !payload.favorite) {
      await FavoritePlace.query().where('place_id', place_id).andWhere('user_id', user_id).delete()
    }

    return await Place.query()
      .withCount('favorite', (query) =>
        query.count('*').as('is_favorite').where('user_id', user_id)
      )
      .withCount('favorite', (query) => query.count('*').as('favorite_count'))
      .where('id', place_id)
      .first()
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
            point.address = ''
            node.tag.forEach((element: any) => {
              if (element['$'].k === 'leisure') {
                point.sportCenter = element['$'].v === 'sports_centre'
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
                point.postalCode = element['$'].v
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
                point.gradeMax = element['$'].v
              }
              if (element['$'].k === 'climbing:grade:french:min') {
                point.gradeMin = element['$'].v
              }
              if (element['$'].k === 'climbing:length') {
                point.lengthMin = element['$'].v
                point.lengthMax = element['$'].v
              }
              if (element['$'].k === 'climbing:length:max') {
                point.lengthMax = element['$'].v
              }
              if (element['$'].k === 'climbing:length:min') {
                point.lengthMin = element['$'].v
              }
              if (element['$'].k === 'climbing:routes') {
                point.routes = element['$'].v
              }
            })

            // const point = new Place()
            point.osmId = node['$'].id
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
    return 'plop'
  }
}

async function updateOSM(place: any, updateData: Array<any>) {
  const changesetId = await createChangeset()

  const currentNode = await getCurrentNode(place.osmId)

  let xmlData =
    '<osm><node id="' +
    currentNode.id +
    '" version="' +
    currentNode.version +
    '" changeset="' +
    changesetId +
    '" lat="' +
    currentNode.lat +
    '" lon="' +
    currentNode.lon +
    '">'

  let keysAdded = []
  for (let [key, value] of Object.entries(currentNode.tags)) {
    keysAdded.push(key)
    if (updateData.find((element) => element.key === key)) {
      value = updateData.find((element) => element.key === key).value
    }
    xmlData += '<tag k="' + key + '" v="' + value + '"/>'
  }
  for (let data of updateData) {
    if (!keysAdded.includes(data.key)) {
      xmlData += '<tag k="' + data.key + '" v="' + data.value + '"/>'
    }
  }

  xmlData += `</node></osm>`

  await updateNode(place.osmId, changesetId, xmlData)

  await closeChangeset(changesetId)
}

async function createChangeset() {
  const xmlChangeset = `
  <osm>
    <changeset>
      <tag k="comment" v="Mise à jour d'un nœud" />
      <tag k="created_by" v="Boulder Problem" />
    </changeset>
  </osm>
`

  let changeset = await axios.request({
    method: 'PUT',
    data: xmlChangeset,
    responseType: 'text',
    url: 'https://api.openstreetmap.org/api/0.6/changeset/create',
    headers: osmHeaders,
  })
  return changeset.data
}

async function getCurrentNode(nodeId: string) {
  let result = await axios.request({
    method: 'get',
    responseType: 'text',
    url: 'https://api.openstreetmap.org/api/0.6/node/' + nodeId,
    headers: osmHeaders,
  })

  return {
    id: JSON.parse(result.data).elements[0].id,
    lat: JSON.parse(result.data).elements[0].lat,
    lon: JSON.parse(result.data).elements[0].lon,
    version: JSON.parse(result.data).elements[0].version,
    tags: JSON.parse(result.data).elements[0].tags,
  }
}

async function updateNode(nodeId: string, changesetId: string, xmlData: any) {
  await axios
    .request({
      method: 'PUT',
      maxBodyLength: Infinity,
      responseType: 'text',
      url: 'https://api.openstreetmap.org/api/0.6/node/' + nodeId,
      data: xmlData,
      headers: osmHeaders,
      params: {
        changeset: changesetId, // Inclure le changeset ID ici
      },
    })
    .then((response) => {
      console.log(JSON.stringify(response.data))
    })
    .catch((error) => {
      console.log(error)
    })
}

async function closeChangeset(changesetId: string) {
  await axios
    .request({
      method: 'PUT',
      responseType: 'text',
      url: 'https://api.openstreetmap.org/api/0.6/changeset/' + changesetId + '/close',
      headers: osmHeaders,
    })
    .then((response) => {
      console.log(JSON.stringify(response.data))
    })
    .catch((error) => {
      console.log(error)
    })
}
