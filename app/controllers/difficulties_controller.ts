import Difficulty from '#models/difficulty'
import type { HttpContext } from '@adonisjs/core/http'

export default class DifficultiesController {
  /**
   * @getDifficulties
   * @summary get difficulties
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]}
   */
  async getDifficulties({ request }: HttpContext) {
    return await Difficulty.query()
  }
}
