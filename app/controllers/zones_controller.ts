import Wall from '#models/wall'
import Zone from '#models/zone'
import { createZoneValidator, updateZoneValidator } from '#validators/zone'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import fs from 'fs'

let imageRoute = `/home/node/app/build/uploads/plans/`
if (process.env.NODE_ENV !== 'production') {
  imageRoute = `./uploads/plans/`
}

export default class ZonesController {
  /**
   * @createZoneId
   * @summary get zone plan
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   * @responseBody 422 - plan don't exist
   */
  async createZone({ request }: HttpContext) {
    let payload = await request.validateUsing(createZoneValidator)

    let imageName
    if (payload.image) {
      // create unique image name
      imageName = `${cuid()}.${payload.image.extname}`
      // save image
      await payload.image.move(app.makePath('uploads/plans'), {
        name: imageName,
      })
    }
    // save zone
    const zone = await Zone.create({
      placeId: payload.placeId,
      name: payload.name,
      floor: payload.floor,
      image: imageName,
    })
    return zone
  }
  /**
   * @getPlan
   * @summary get zone plan
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   * @responseBody 422 - plan don't exist
   */
  async getPlan({ request, response }: HttpContext) {
    let zone = await Zone.findOrFail(request.params().id)
    if (zone.image) {
      const image = await fs.createReadStream(imageRoute + zone.image)
      response.stream(image)
    } else {
      response.status(422).send("plan don't exist")
      return
    }
  }

  /**
   * @updateZoneId
   * @summary get zone plan
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getZoneId({ request }: HttpContext) {
    return await Zone.findOrFail(request.params().id)
  }

  /**
   * @updateZoneId
   * @summary get zone plan
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getWallsZone({ request }: HttpContext) {
    return await Wall.query().where('zone_id', request.params().id).orderBy('created_at', 'asc')
  }

  /**
   * @updateZoneId
   * @summary get zone plan
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async updateZoneId({ request }: HttpContext) {
    let payload = await request.validateUsing(updateZoneValidator)
    let zone = await Zone.findOrFail(request.params().id)

    console.log(payload)

    let imageName
    if (payload.image) {
      if (zone.image) {
        // delete old image
        fs.rmSync(imageRoute + zone.image)
      }
      // create unique image name
      imageName = `${cuid()}.${payload.image.extname}`
      // save image
      payload.image.move(app.makePath('uploads/plans'), {
        name: imageName,
      })
    }
    // save zone
    await zone.merge({ ...{ name: payload.name, floor: payload.floor, image: imageName } }).save()

    return await Zone.findOrFail(request.params().id)
  }

  async deleteZoneId({ request }: HttpContext) {
    let zone = await Zone.findOrFail(request.params().id)

    // delete old image
    if (zone.image) {
      fs.rmSync(imageRoute + zone.image)
    }

    // delete zone
    await zone.delete()

    return {
      deleted: true,
    }
  }
}
