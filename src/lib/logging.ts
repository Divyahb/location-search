import { FastifyInstance } from 'fastify';

type AppError = Error & {
    statusCode?: number;
    code?: string;
};

const registerLogging = (server: FastifyInstance): void => {
    server.setErrorHandler((error, request, reply) => {
        const appError = error as AppError;
        const statusCode = appError.statusCode ?? 500;

        if (statusCode >= 500) {
            request.log.error(
                {
                    err: appError,
                    method: request.method,
                    url: request.url,
                },
                'Unhandled request error'
            );
        } else {
            request.log.warn(
                {
                    code: appError.code,
                    message: appError.message,
                    method: request.method,
                    url: request.url,
                },
                'Request failed'
            );
        }

        reply.status(statusCode).send({
            code: appError.code,
            message: appError.message,
            statusCode,
        });
    });
};

export default registerLogging;
