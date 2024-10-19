import vine from '@vinejs/vine'

/**
 * Validates the post's creation action
 */
export const createZoneValidator = vine.compile(
  vine.object({
    place_id: vine.any(),
    image: vine
      .file({
        size: '1mb',
        extnames: ['svg'],
      })
      .optional(),
    name: vine.string(),
    floor: vine.string().optional(),
  })
)

export const updateZoneValidator = vine.compile(
  vine.object({
    image: vine
      .file({
        size: '1mb',
        extnames: ['svg'],
      })
      .optional(),
    name: vine.string().optional(),
    floor: vine.string().optional(),
  })
)
