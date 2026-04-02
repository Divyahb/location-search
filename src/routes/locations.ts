import { Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';
import { LocationPostRequest, Location } from '../types';
import { LocationSchema, ErrorResponseSchema, LocationPostSchema, LocationSearchResponseSchema } from '../schemas';
import LocationService from '../services/locations.service';

const errorResponses = {
    400: ErrorResponseSchema,
    403: ErrorResponseSchema,
    404: ErrorResponseSchema,
    500: ErrorResponseSchema,
};

const routes = async (server: FastifyInstance, deps: {
    locationService: LocationService
}): Promise<void> => {

    server.get<{ Querystring: { x: number, y: number } }>('/locations/search', {
        schema: {
            tags: ['location'],
            description: 'Get visible locations by user co-ordinates',
            querystring: Type.Object({
                x: Type.Number(),
                y: Type.Number()
            }),
            response: {
                200: Type.Array(LocationSearchResponseSchema),
                ...errorResponses
            }
        }
    }, async (request, reply) => {
        const { x, y } = request.query;
        return await deps.locationService.searchLocationsByCoordinates(x, y);
    })

    server.get<{ Params: { id: string } }>('/locations/:id', {
        schema: {
            tags: ['location'],
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
        const location = await deps.locationService.findById(id);

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
            tags: ['location'],
            description: 'Update location by id',
            body: LocationSchema,
            response: {
                200: LocationSchema,
                ...errorResponses
            }
        }
    }, async (request, reply) => {
        const location = await deps.locationService.updateLocation(request.body);
        return location;
    })

    server.delete<{ Params: { id: string } }>('/locations/:id', {
        schema: {
            tags: ['location'],
            description: 'Delete location by id',
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
        const location = await deps.locationService.deleteLocation(id);

        if (!location) {
            return reply.code(404).send({
                statusCode: 404,
                message: `Location ${id} not found`,
            });
        }

        return location;
    })

    server.post<{ Body: LocationPostRequest }>('/locations', {
        schema: {
            tags: ['location'],
            description: 'Create a new location. Id auto-generated',
            body: LocationPostSchema,
            response: {
                200: LocationSchema,
                ...errorResponses
            }
        }
    }, async (request) => {
        const location = await deps.locationService.createLocation(request.body);
        return location;
    })

}

export default routes;
