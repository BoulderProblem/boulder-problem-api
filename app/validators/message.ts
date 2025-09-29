import vine from '@vinejs/vine'

export const createConversationValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    userIds: vine.array(vine.any()),
  })
)
