// import type { HttpContext } from '@adonisjs/core/http'

import Place from '#models/place'
import { HttpContext } from '@adonisjs/core/http'
import { Database } from '@adonisjs/lucid/database'
import nodeFetch from 'node-fetch'
import { parseString } from 'xml2js'
import db from '@adonisjs/lucid/services/db'

export default class PlacesController {
  async places({ request }: HttpContext) {
    return await Place.query()
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
                point.address = element['$'].v
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
