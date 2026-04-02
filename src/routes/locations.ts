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

const buildErrorResponse = (statusCode: number, message: string) => ({
    code: statusCode,
    message,
    statusCode,
});

const routes = async (server: FastifyInstance, deps: {
    locationService: LocationService
}): Promise<void> => {
    server.get<{ Querystring: { skip: number, limit: number } }>('/locations', {
        schema: {
            tags: ['location'],
            description: 'Get locations with pagination',
            querystring: Type.Object({
                skip: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
                limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 500, default: 50 }))
            }),
            response: {
                200: Type.Array(LocationSchema),
                ...errorResponses
            }
        }
    }, async (request) => {
        const { skip, limit } = request.query;
        return await deps.locationService.getLocations(skip, limit);
    })

    server.get<{ Querystring: { x: number, y: number, skip: number, limit: number } }>('/locations/search', {
        schema: {
            tags: ['location'],
            description: 'Get visible locations by user co-ordinates',
            querystring: Type.Object({
                x: Type.Number(),
                y: Type.Number(),
                skip: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
                limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 500, default: 50 }))
            }),
            response: {
                200: Type.Array(LocationSearchResponseSchema),
                ...errorResponses
            }
        }
    }, async (request) => {
        const { x, y, skip, limit } = request.query;
        return await deps.locationService.searchLocationsByCoordinates(x, y, skip, limit);
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
            return reply.code(404).send(buildErrorResponse(404, `Location ${id} not found`));
        }

        return location;
    })

    server.put<{ Params: { id: string }, Body: LocationPostRequest }>('/locations/:id', {
        schema: {
            tags: ['location'],
            description: 'Update location by id',
            params: Type.Object({
                id: Type.String()
            }),
            body: LocationPostSchema,
            response: {
                200: LocationSchema,
                ...errorResponses
            }
        }
    }, async (request, reply) => {
        const location = await deps.locationService.updateLocation({
            id: request.params.id,
            ...request.body,
        });

        if (!location) {
            return reply.code(404).send(buildErrorResponse(404, `Location ${request.params.id} not found`));
        }

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
            return reply.code(404).send(buildErrorResponse(404, `Location ${id} not found`));
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
