import User from '#models/user';
import { assert } from '../utils.js';
import { createUserValidator, updateUserValidator } from '#validators/user';
import Follow from '#models/follow';
import { DateTime } from 'luxon';
export default class UsersController {
    async register({ request }) {
        let payload = await request.validateUsing(createUserValidator);
        const user = await User.create(payload);
        const token = await User.accessTokens.create(user);
        return { user, token };
    }
    async getUsers({ auth }) {
        assert(auth.user, 'kindly login');
        return await User.query()
            .withCount('followers', (query) => query.count('*').as('follower'))
            .withCount('followings', (query) => query.count('*').as('following'));
    }
    async updateUserId({ auth, request }) {
        assert(auth.user, 'kindly login');
        let payload = await request.validateUsing(updateUserValidator);
        let user = await User.findOrFail(request.params().id);
        await user.merge({ ...payload, ...{ updatedAt: DateTime.local() } }).save();
        return user;
    }
    async getUserId({ request }) {
        return await User.query()
            .withCount('followers', (query) => query.count('*').as('follower'))
            .withCount('followings', (query) => query.count('*').as('following'))
            .where('id', request.params().id);
    }
    async followUser({ auth, request }) {
        assert(auth.user, 'kindly login');
        let user_following_id = request.params().id;
        let user_follower_id = auth.user.id;
        await User.findOrFail(user_following_id);
        let follow = await Follow.query()
            .where('user_follower_id', user_follower_id)
            .andWhere('user_following_id', user_following_id);
        console.log(follow.length);
        if (follow.length === 0) {
            await Follow.create({ user_follower_id, user_following_id });
            return await User.query().preload('followers').where('id', user_following_id);
        }
        else {
            await Follow.query()
                .where('user_follower_id', user_follower_id)
                .andWhere('user_following_id', user_following_id)
                .delete();
            return await User.query().preload('followers').where('id', user_following_id);
        }
    }
}
//# sourceMappingURL=users_controller.js.map