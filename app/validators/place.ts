import vine from '@vinejs/vine'

/**
 * Validates the post's creation action
 */
export const addPlanValidator = vine.compile(
  vine.object({
    plan: vine.file({
      size: '1mb',
      extnames: ['svg'],
    }),
  })
)
