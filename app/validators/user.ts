import vine from '@vinejs/vine'

/**
 * Validates the user's creation action
 */
export const createUserValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .trim()
      .toLowerCase()
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
    genderId: vine.number(),
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
    genderId: vine.number().optional(),
    roleId: vine.number().optional(),
    avatar: vine
      .file({
        size: '10mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .optional(),
    bio: vine.string().optional(),
  })
)
