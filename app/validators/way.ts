import vine from '@vinejs/vine'

/**
 * Validates the post's creation action
 */
export const createWayValidator = vine.compile(
  vine.object({
    wallId: vine.any(),
    colorId: vine.number(),
    difficultyId: vine.number(),
    style: vine.string(),
    routeSetter: vine.string(),
    name: vine.string(),
    image: vine.string().optional(),
  })
)

export const updateWayValidator = vine.compile(
  vine.object({
    colorId: vine.number().optional(),
    difficultyId: vine.number().optional(),
    style: vine.string().optional(),
    routeSetter: vine.string().optional(),
    name: vine.string().optional(),
    image: vine.string().nullable().optional(),
  })
)

export const commentWayValidator = vine.compile(
  vine.object({
    text: vine.string(),
  })
)

export const noteWayValidator = vine.compile(
  vine.object({
    note: vine.number().min(0).max(5),
  })
)

export const validWayValidator = vine.compile(
  vine.object({
    status: vine.string(),
  })
)
