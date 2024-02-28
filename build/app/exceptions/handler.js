import app from '@adonisjs/core/services/app';
import { ExceptionHandler } from '@adonisjs/core/http';
import { errors } from '@vinejs/vine';
export default class HttpExceptionHandler extends ExceptionHandler {
    debug = !app.inProduction;
    async handle(error, ctx) {
        if (error instanceof errors.E_VALIDATION_ERROR) {
        }
        else if (error.code === 'E_ROUTE_NOT_FOUND') {
            return ctx.response.status(error.status).send("la route demandée n'existe pas");
        }
        else if (error.code === '22P02') {
            return ctx.response.status(error.status).send('Requête invalide');
        }
        return super.handle(error, ctx);
    }
    async report(error, ctx) {
        return super.report(error, ctx);
    }
}
//# sourceMappingURL=handler.js.map