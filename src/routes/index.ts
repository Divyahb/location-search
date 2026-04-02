import { Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';
import { HealthResponse } from '../types';

const routes = async (server: FastifyInstance): Promise<void> => {
    server.get<{ Reply: HealthResponse }>('/health', {
        schema: {
            tags: ['health'],
            description: 'Get health of the application',
            response: {
                200: Type.Object({
                    status: Type.String()
                })
            }
        }
    }, () => {
        return ({ status: 'ok' })
    })
}

export default routes;
