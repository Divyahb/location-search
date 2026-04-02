import fastify from 'fastify';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import mongoPlugin from './plugins/mongodb';
import routes from './routes';
import LocationRepository from './repositories/location.repository';
import { StoredLocation } from './types';
import { seedLocations } from './services/seed-locations.service';


const buildServer = async () => {
    const server = fastify({ logger: true });
    await server.register(fastifySwagger, {
        swagger: {
            info: {
                title: 'bonial',
                description: 'Locations',
                version: '1.0'
            },
            host: 'localhost:3000',
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json']
        },
    })

    await server.register(fastifySwaggerUi, {
        routePrefix: '/docs'
    });

    await server.register(mongoPlugin);
    await seedLocations(server);
    const collection = server.mongo.db?.collection<StoredLocation>('locations');

    if (!collection) {
        throw new Error('MongoDB collection is not available');
    }

    await server.register(routes, {
        locationRepository: new LocationRepository(collection)
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
