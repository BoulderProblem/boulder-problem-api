import vine from '@vinejs/vine'

/**
 * Validates the post's creation action
 */
export const updatePlaceValidator = vine.compile(
  vine.object({
    coordinate: vine.any().optional(),
    geocoordinate: vine.any().optional(),
    sportCenter: vine.boolean(),
    name: vine.string(),
    hours: vine.string(),
    phone: vine.string(),
    website: vine.string(),
    city: vine.string(),
    postalCode: vine.string(),
    address: vine.string(),
    outdoor: vine.boolean().optional(),
    gradeMin: vine.string().optional(),
    gradeMax: vine.string().optional(),
    lengthMin: vine.string().optional(),
    lengthMax: vine.string().optional(),
    routes: vine.string().optional(),
  })
)
