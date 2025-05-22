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
    hours: vine.string().optional(),
    phone: vine.string().optional(),
    website: vine.string().optional(),
    city: vine.string().optional(),
    street: vine.string().optional(),
    houseNumber: vine.string().optional(),
    postalCode: vine.string().optional(),
    address: vine.string().optional(),
    outdoor: vine.boolean().optional(),
    gradeMin: vine.string().optional(),
    gradeMax: vine.string().optional(),
    lengthMin: vine.string().optional(),
    lengthMax: vine.string().optional(),
    routes: vine.string().optional(),
    ownerId: vine.any().optional(),
  })
)

export const favoritePlaceValidator = vine.compile(
  vine.object({
    favorite: vine.boolean(),
  })
)
