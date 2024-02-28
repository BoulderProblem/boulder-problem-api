import User from '#models/user';
import { assert } from '../utils.js';
export default class AuthController {
    async login({ request }) {
        const { email, password } = request.all();
        console.log(request.all());
        const user = await User.verifyCredentials(email, password);
        const token = await User.accessTokens.create(user);
        return { user, token };
    }
    async logout({ auth }) {
        assert(auth.user, 'kindly login');
        await User.accessTokens.delete(auth.user, auth.user.currentAccessToken.identifier);
        return {
            revoked: true,
        };
    }
}
//# sourceMappingURL=auth_controller.js.map