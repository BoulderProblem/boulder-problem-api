import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'

// Règle personnalisée pour vérifier l'existence d'une place
const placeExists = vine.createRule(async (value, _options, field) => {
  if (typeof value !== 'number') {
    return
  }

  const place = await db.from('places').where('id', value).first()

  if (!place) {
    field.report('The selected place does not exist', 'placeExists', field)
  }
})

export const createContestValidator = vine.compile(
  vine.object({
    user_id: vine
      .string()
      .uuid()
      .exists(async (db, value) => {
        const user = await db.from('users').where('id', value).first()
        return !!user
      }),
    name: vine.string(),
    description: vine.string(),
    place_id: vine.number().use(placeExists()),
    start_date: vine.date({
      formats: ['YYYY/MM/DD', 'x'],
    }),
    end_date: vine.date({
      formats: ['YYYY/MM/DD', 'x'],
    }),
  })
)
export const updateContestValidator = vine.compile(
  vine.object({
    user_id: vine
      .string()
      .uuid()
      .exists(async (db, value) => {
        const user = await db.from('users').where('id', value).first()
        return !!user
      }),
    name: vine.string(),
    description: vine.string(),
    status: vine.enum(['waiting', 'valid', 'cancelled'] as const),
    place_id: vine.number().optional().use(placeExists()),
    start_date: vine.date({
      formats: ['YYYY/MM/DD', 'x'],
    }),
    end_date: vine.date({
      formats: ['YYYY/MM/DD', 'x'],
    }),
  })
)
