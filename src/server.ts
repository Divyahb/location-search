import fastify from 'fastify';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import mongoPlugin from './plugins/mongodb';
import defaultRoutes from './routes';
import locationRoutes from './routes/locations';
import LocationRepository from './repositories/location.repository';
import LocationService from './services/locations.service';
import { StoredLocation } from './types';
import registerLogging from './lib/logging';

const buildServer = async () => {
    const server = fastify({ logger: true });
    await server.register(fastifySwagger, {
        swagger: {
            info: {
                title: 'locations',
                version: '1.0'
            },
            consumes: ['application/json'],
            produces: ['application/json'],
            tags: [{ name: 'health', description: 'Default application routes' },
            { name: 'location', description: 'Location routes' }
            ]
        },
    })

    await server.register(fastifySwaggerUi, {
        routePrefix: '/docs'
    });

    await server.register(mongoPlugin);
    registerLogging(server);

    const collection = server.mongo.db?.collection<StoredLocation>('locations');

    if (!collection) {
        throw new Error('MongoDB collection is not available');
    }

    const locationRepository = new LocationRepository(collection);
    const locationService = new LocationService(locationRepository);

    await server.register(defaultRoutes);

    await server.register(locationRoutes, {
        locationService
    });

    return server;
}



const start = async () => {
    const server = await buildServer();

    try {
        await server.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
