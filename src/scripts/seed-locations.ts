import fastify from 'fastify';
import mongoPlugin from '../plugins/mongodb';
import { seedLocations } from '../services/seed-locations.service';

const run = async (): Promise<void> => {
    const server = fastify({ logger: true });

    try {
        await server.register(mongoPlugin);
        await seedLocations(server);
    } finally {
        await server.close();
    }
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
