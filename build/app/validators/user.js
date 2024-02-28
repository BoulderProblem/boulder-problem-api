import vine from '@vinejs/vine';
export const createUserValidator = vine.compile(vine.object({
    email: vine
        .string()
        .trim()
        .email()
        .normalizeEmail()
        .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first();
        return !user;
    }),
    password: vine.string().trim().minLength(6),
    firstname: vine.string().trim().minLength(2),
    lastname: vine.string().trim().minLength(2),
    birth_date: vine.date({
        formats: ['YYYY/MM/DD', 'x'],
    }),
    gender_id: vine.number(),
}));
export const updateUserValidator = vine.compile(vine.object({
    firstname: vine.string().trim().minLength(2).optional(),
    lastname: vine.string().trim().minLength(2).optional(),
    birth_date: vine
        .date({
        formats: ['YYYY/MM/DD', 'x'],
    })
        .optional(),
    gender_id: vine.number().optional(),
}));
//# sourceMappingURL=user.js.map