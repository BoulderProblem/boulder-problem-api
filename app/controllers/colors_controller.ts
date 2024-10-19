import Color from '#models/color'
import type { HttpContext } from '@adonisjs/core/http'

export default class ColorsController {
  /**
   * @getColors
   * @summary get colors
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getColors({ request }: HttpContext) {
    return await Color.query()
  }
}
