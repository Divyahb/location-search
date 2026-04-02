import { Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';
import { HealthResponse, LocationPostRequest, Location } from './types';
import { LocationSchema, ErrorResponseSchema, LocationPostSchema, } from './schemas';
import LocationRepository from './repositories/location.repository';

const errorResponses = {
    400: ErrorResponseSchema,
    403: ErrorResponseSchema,
    404: ErrorResponseSchema,
    500: ErrorResponseSchema,
};

const routes = async (server: FastifyInstance, deps: { locationRepository: LocationRepository }): Promise<void> => {
    server.get<{ Reply: HealthResponse }>('/health', {
        schema: {
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

    server.get<{ Params: { id: string } }>('/locations/:id', {
        schema: {
            description: 'Get location by id',
            params: Type.Object({
                id: Type.String()
            }),
            response: {
                200: LocationSchema,
                ...errorResponses
            }
        }
    }, async (request, reply) => {
        const id = request.params.id;
        const location = await deps.locationRepository.findById(id);

        if (!location) {
            return reply.code(404).send({
                code: 404,
                message: `Location ${id} not found`,
            });
        }

        return location;
    })

    server.put<{ Body: Location }>('/locations', {
        schema: {
            description: 'Get location by id',
            body: LocationSchema,
            response: {
                200: LocationSchema,
                ...errorResponses
            }
        }
    }, async (request, reply) => {
        const location = await deps.locationRepository.updateOne(request.body);
        return location;
    })

    server.delete<{ Params: { id: string } }>('/locations/:id', {
        schema: {
            description: 'Get location by id',
            params: Type.Object({
                id: Type.String()
            }),
            response: {
                200: LocationSchema,
                ...errorResponses
            }
        }
    }, async (request, reply) => {
        const id = request.params.id;
        const location = await deps.locationRepository.deleteOne(id);

        if (!location) {
            return reply.code(404).send({
                code: 404,
                message: `Location ${id} not found`,
            });
        }

        return location;
    })

    server.post<{ Body: LocationPostRequest }>('/locations', {
        schema: {
            description: 'Create a new location. Id auto-generated',
            body: LocationPostSchema,
            response: {
                200: LocationSchema,
                ...errorResponses
            }
        }
    }, async (request) => {
        const location = await deps.locationRepository.createOne(request.body);
        return location;
    })
}

export default routes;
