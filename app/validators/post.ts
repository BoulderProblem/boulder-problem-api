import vine from '@vinejs/vine'

/**
 * Validates the post's creation action
 */
export const createPostValidator = vine.compile(
  vine.object({
    title: vine.string(),
    images: vine
      .any()
      .transform((value) => {
        if (!value) return []
        if (Array.isArray(value)) return value
        return [value]
      })
      .optional(),
    text: vine.string(),
    location: vine.string().optional(),
  })
)

/**
 * Validates the post's update action
 */
export const updatePostValidator = vine.compile(
  vine.object({
    title: vine.string().optional(),
    text: vine.string().optional(),
    location: vine.string().optional(),
  })
)

export const createCommentValidator = vine.compile(
  vine.object({
    text: vine.string(),
  })
)

export const likePostValidator = vine.compile(
  vine.object({
    like: vine.boolean(),
  })
)
