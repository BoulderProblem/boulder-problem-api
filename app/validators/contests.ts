import vine from '@vinejs/vine'
import { stat } from 'fs'

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
    start_date: vine.date({
      formats: ['YYYY/MM/DD', 'x'],
    }),
    end_date: vine.date({
      formats: ['YYYY/MM/DD', 'x'],
    }),
  })
)
