import vine from '@vinejs/vine'

/**
 * Validates the post's creation action
 */
export const createPostValidator = vine.compile(
  vine.object({
    title: vine.string(),
    images: vine.array(
      vine.file({
        size: '2mb',
        extnames: ['jpg', 'png'],
      })
    ),
    text: vine.string(),
  })
)

/**
 * Validates the post's update action
 */
export const updatePostValidator = vine.compile(
  vine.object({
    title: vine.string().optional(),
    text: vine.string().optional(),
  })
)

export const createCommentValidator = vine.compile(
  vine.object({
    text: vine.string(),
  })
)

export const favoritePostValidator = vine.compile(
  vine.object({
    favorite: vine.boolean(),
  })
)
