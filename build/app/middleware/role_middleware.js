import Roles from '../enums/roles.js';
export default class AuthMiddleware {
    redirectTo = '/login';
    async handle({ auth, response }, next, guards) {
        const roleIds = guards.map((guard) => Roles[guard]);
        if (!roleIds.includes(auth.user?.roleId)) {
            return response.unauthorized({ error: `This is restricted to ${guards.join(', ')} users` });
        }
        await next();
    }
}
//# sourceMappingURL=role_middleware.js.map