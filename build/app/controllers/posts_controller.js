import { assert } from '../utils.js';
import Post from '#models/post';
import { createCommentValidator, createPostValidator, updatePostValidator } from '#validators/post';
import Like from '#models/like';
import app from '@adonisjs/core/services/app';
import { cuid } from '@adonisjs/core/helpers';
import { DateTime } from 'luxon';
import fs from 'fs';
import Comment from '#models/comment';
export default class PostsController {
    async getPosts({ auth }) {
        assert(auth.user, 'kindly login');
        let user_id = auth.user.id;
        return await Post.query()
            .preload('user')
            .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
            .withCount('likes', (query) => query.count('*').as('likes_count'))
            .withCount('comments', (query) => query.count('*').as('comments_count'))
            .where('user_id', user_id);
    }
    async addPosts({ auth, request }) {
        assert(auth.user, 'kindly login');
        let payload = await request.validateUsing(createPostValidator);
        let imageids = [];
        payload.images.forEach((image) => {
            let imageName = `${cuid()}.${image.extname}`;
            imageids.push(imageName);
            image.move(app.makePath('uploads/posts'), {
                name: imageName,
            });
        });
        const post = await Post.create({
            title: payload.title,
            text: payload.text,
            image: imageids,
            user_id: auth.user.id,
        });
        return post;
    }
    async updatePosts({ request }) {
        let payload = await request.validateUsing(updatePostValidator);
        let post = await Post.findOrFail(request.params().id);
        await post.merge({ ...payload, ...{ updatedAt: DateTime.local() } }).save();
        return await Post.findOrFail(request.params().id);
    }
    async getImage({ request, response }) {
        let post = await Post.findOrFail(request.params().id);
        const image = fs.createReadStream('./uploads/posts/' + request.params().id_image);
        response.stream(image);
    }
    async getPostId({ auth, request }) {
        assert(auth.user, 'kindly login');
        let user_id = auth.user.id;
        return await Post.query()
            .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
            .withCount('likes', (query) => query.count('*').as('likes_count'))
            .where('id', request.params().id);
    }
    async deletePostId({ request }) {
        const post = await Post.findOrFail(request.params().id);
        await post.delete();
        return { success: true };
    }
    async likePost({ auth, request }) {
        assert(auth.user, 'kindly login');
        let post_id = request.params().id;
        let user_id = auth.user.id;
        await Post.findOrFail(post_id);
        let like = await Like.query().where('post_id', post_id).andWhere('user_id', user_id);
        console.log(like.length);
        if (like.length === 0) {
            await Like.create({ post_id, user_id });
            return await Post.query()
                .preload('user')
                .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
                .withCount('likes', (query) => query.count('*').as('likes_count'))
                .where('id', post_id);
        }
        else {
            await Like.query().where('post_id', post_id).andWhere('user_id', user_id).delete();
            return await Post.query()
                .preload('user')
                .withCount('likes', (query) => query.count('*').as('is_like').where('user_id', user_id))
                .withCount('likes', (query) => query.count('*').as('likes_count'))
                .where('id', post_id);
        }
    }
    async createComment({ auth, request }) {
        assert(auth.user, 'kindly login');
        let payload = await request.validateUsing(createCommentValidator);
        await Comment.create({
            user_id: auth.user.id,
            text: payload.text,
            post_id: request.params().id,
        });
    }
}
//# sourceMappingURL=posts_controller.js.map