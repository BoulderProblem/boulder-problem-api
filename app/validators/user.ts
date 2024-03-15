import vine from '@vinejs/vine'

/**
 * Validates the user's creation action
 */
export const createUserValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail({
        all_lowercase: true,
        gmail_remove_dots: false,
      })
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    password: vine.string().trim().minLength(6),
    firstname: vine.string().trim().minLength(2),
    lastname: vine.string().trim().minLength(2),
    birth_date: vine.date({
      formats: ['YYYY/MM/DD', 'x'],
    }),
    gender_id: vine.number(),
  })
)

/**
 * Validates the user's update action
 */
export const updateUserValidator = vine.compile(
  vine.object({
    firstname: vine.string().trim().minLength(2).optional(),
    lastname: vine.string().trim().minLength(2).optional(),
    birth_date: vine
      .date({
        formats: ['YYYY/MM/DD', 'x'],
      })
      .optional(),
    gender_id: vine.number().optional(),
  })
)
