import vine from '@vinejs/vine';
export const createPostValidator = vine.compile(vine.object({
    title: vine.string(),
    images: vine.array(vine.file({
        size: '2mb',
        extnames: ['jpg', 'png'],
    })),
    text: vine.string(),
}));
export const updatePostValidator = vine.compile(vine.object({
    title: vine.string().optional(),
    text: vine.string().optional(),
}));
export const createCommentValidator = vine.compile(vine.object({
    text: vine.string(),
}));
//# sourceMappingURL=post.js.map