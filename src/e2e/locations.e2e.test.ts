import test from 'node:test';
import assert from 'node:assert/strict';
import fastify, { FastifyInstance } from 'fastify';

import defaultRoutes from '../routes';
import locationRoutes from '../routes/locations';
import { Location, LocationPostRequest, LocationSearchResponse } from '../types';
import LocationService from '../services/locations.service';

type LocationServiceStub = {
    getLocations: (skip: number, limit: number) => Promise<Location[]>;
    findById: (id: string) => Promise<Location | null>;
    createLocation: (location: LocationPostRequest) => Promise<Location>;
    updateLocation: (location: Location) => Promise<Location | null>;
    deleteLocation: (id: string) => Promise<Location | null>;
    searchLocationsByCoordinates: (x: number, y: number, skip: number, limit: number) => Promise<LocationSearchResponse[]>;
};

const sampleLocation: Location = {
    id: '19e1545c-8b65-4d83-82f9-7fcad4a23114',
    name: 'Mantra Restaurant',
    type: 'restaurant',
    'opening-hours': 'Mon-Sun 9:00-22:00',
    image: 'https://example.com/mantra.jpg',
    radius: 2,
    coordinates: 'x=2,y=2',
};

const buildTestServer = async (locationService: LocationServiceStub): Promise<FastifyInstance> => {
    const app = fastify();

    await app.register(defaultRoutes);
    await app.register(locationRoutes, {
        locationService: locationService as unknown as LocationService,
    });

    return app;
};

test('GET /health returns ok', async () => {
    const app = await buildTestServer({
        getLocations: async () => [],
        findById: async () => null,
        createLocation: async (location) => ({ id: 'new-id', ...location }),
        updateLocation: async () => null,
        deleteLocation: async () => null,
        searchLocationsByCoordinates: async () => [],
    });

    const response = await app.inject({
        method: 'GET',
        url: '/health',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: 'ok' });

    await app.close();
});

test('GET /locations applies skip and limit', async () => {
    const app = await buildTestServer({
        getLocations: async (skip, limit) => {
            assert.equal(skip, 5);
            assert.equal(limit, 2);
            return [sampleLocation];
        },
        findById: async () => null,
        createLocation: async (location) => ({ id: 'new-id', ...location }),
        updateLocation: async () => null,
        deleteLocation: async () => null,
        searchLocationsByCoordinates: async () => [],
    });

    const response = await app.inject({
        method: 'GET',
        url: '/locations?skip=5&limit=2',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), [sampleLocation]);

    await app.close();
});

test('GET /locations/search returns nearest visible locations in ascending distance order', async () => {
    const results: LocationSearchResponse[] = [
        {
            id: '1',
            name: 'A',
            coordinates: 'x=2,y=2',
            distance: 1,
        },
        {
            id: '2',
            name: 'B',
            coordinates: 'x=3,y=3',
            distance: 1.5,
        },
    ];

    const app = await buildTestServer({
        getLocations: async () => [],
        findById: async () => null,
        createLocation: async (location) => ({ id: 'new-id', ...location }),
        updateLocation: async () => null,
        deleteLocation: async () => null,
        searchLocationsByCoordinates: async (x, y, skip, limit) => {
            assert.equal(x, 3);
            assert.equal(y, 2);
            assert.equal(skip, 1);
            assert.equal(limit, 10);
            return results;
        },
    });

    const response = await app.inject({
        method: 'GET',
        url: '/locations/search?x=3&y=2&skip=1&limit=10',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), results);

    await app.close();
});

test('GET /locations/search returns 400 for invalid query params', async () => {
    const app = await buildTestServer({
        getLocations: async () => [],
        findById: async () => null,
        createLocation: async (location) => ({ id: 'new-id', ...location }),
        updateLocation: async () => null,
        deleteLocation: async () => null,
        searchLocationsByCoordinates: async () => [],
    });

    const response = await app.inject({
        method: 'GET',
        url: '/locations/search?x=invalid&y=2',
    });

    assert.equal(response.statusCode, 400);

    const body = response.json();
    assert.equal(body.statusCode, 400);
    assert.ok(typeof body.message === 'string');

    await app.close();
});

test('GET /locations/:id returns 404 when location is missing', async () => {
    const app = await buildTestServer({
        getLocations: async () => [],
        findById: async () => null,
        createLocation: async (location) => ({ id: 'new-id', ...location }),
        updateLocation: async () => null,
        deleteLocation: async () => null,
        searchLocationsByCoordinates: async () => [],
    });

    const response = await app.inject({
        method: 'GET',
        url: '/locations/missing-id',
    });

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), {
        code: 404,
        message: 'Location missing-id not found',
        statusCode: 404,
    });

    await app.close();
});

test('POST /locations creates a location', async () => {
    const payload: LocationPostRequest = {
        name: 'New Place',
        type: 'restaurant',
        'opening-hours': 'Mon-Fri 9:00-18:00',
        image: 'https://example.com/new-place.jpg',
        radius: 3,
        coordinates: 'x=10,y=10',
    };

    const app = await buildTestServer({
        getLocations: async () => [],
        findById: async () => null,
        createLocation: async (location) => ({
            id: 'generated-id',
            ...location,
        }),
        updateLocation: async () => null,
        deleteLocation: async () => null,
        searchLocationsByCoordinates: async () => [],
    });

    const response = await app.inject({
        method: 'POST',
        url: '/locations',
        payload,
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {
        id: 'generated-id',
        ...payload,
    });

    await app.close();
});

test('DELETE /locations/:id returns deleted location', async () => {
    const app = await buildTestServer({
        getLocations: async () => [],
        findById: async () => null,
        createLocation: async (location) => ({ id: 'new-id', ...location }),
        updateLocation: async () => null,
        deleteLocation: async () => sampleLocation,
        searchLocationsByCoordinates: async () => [],
    });

    const response = await app.inject({
        method: 'DELETE',
        url: '/locations/19e1545c-8b65-4d83-82f9-7fcad4a23114',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), sampleLocation);

    await app.close();
});
