import path from 'node:path';
import url from 'node:url';
export default {
    path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../',
    title: 'Boulder problem',
    version: '1.0.0',
    tagIndex: 1,
    snakeCase: true,
    ignore: ['/swagger', '/docs', '/'],
    preferredPutPatch: 'PUT',
    common: {
        parameters: {},
        headers: {},
    },
    persistAuthorization: true,
};
//# sourceMappingURL=swagger.js.map