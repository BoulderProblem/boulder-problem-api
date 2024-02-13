import vine from '@vinejs/vine'

/**
 * Validates the post's creation action
 */
export const createPostValidator = vine.compile(
  vine.object({
    title: vine.string(),
    image: vine.string(),
    text: vine.string(),
  })
)

/**
 * Validates the post's update action
 */
export const updatePostValidator = vine.compile(
  vine.object({
    title: vine.string().optional(),
    image: vine.string().optional(),
    text: vine.string().optional(),
  })
)
