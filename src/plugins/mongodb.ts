import fp from 'fastify-plugin';
import fastifyMongo from '@fastify/mongodb';
import { FastifyInstance } from 'fastify';

const mongoPlugin = fp(async (server: FastifyInstance): Promise<void> => {
    const url = process.env.MONGO_URL;

    if (!url) {
        throw new Error('MONGO_URL is not configured');
    }

    await server.register(fastifyMongo, {
        forceClose: true,
        url,
    });

});

export default mongoPlugin;
