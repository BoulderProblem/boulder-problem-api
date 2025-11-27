import vine from '@vinejs/vine'

/**
 * Validates the login action
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().toLowerCase().email().normalizeEmail({
      all_lowercase: true,
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
    }),
    password: vine.string().trim().minLength(6),
  })
)

/**
 * Validates the lost password action
 */
export const lostPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().trim().toLowerCase().email().normalizeEmail({
      all_lowercase: true,
      gmail_remove_dots: false,
    }),
  })
)

/**
 * Validates the reset password action
 */
export const resetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().trim().toLowerCase().email().normalizeEmail({
      all_lowercase: true,
      gmail_remove_dots: false,
    }),
    password: vine.string().trim().minLength(6),
    code: vine.number().min(100000).max(999999),
  })
)
