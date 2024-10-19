import vine from '@vinejs/vine'

/**
 * Validates the post's creation action
 */
export const createWallValidator = vine.compile(
  vine.object({
    zone_id: vine.any(),
    name: vine.string(),
  })
)
