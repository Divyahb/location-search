import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { FastifyInstance } from 'fastify';
import { Location } from '../types';

const LOCATIONS_COLLECTION = 'locations';
const DEFAULT_LOCATIONS_PATH = path.resolve(process.cwd(), 'data', 'locations.json');

const seedLocations = async (server: FastifyInstance): Promise<void> => {
    const collection = server.mongo.db?.collection<Location>(LOCATIONS_COLLECTION);

    if (!collection) {
        throw new Error('MongoDB collection is not available');
    }

    await collection.createIndex({ id: 1 }, { unique: true });

    const fileContents = await readFile(DEFAULT_LOCATIONS_PATH, 'utf-8');
    const { locations } = JSON.parse(fileContents);

    if (!Array.isArray(locations)) {
        throw new Error('locations.json must contain an array');
    }

    if (locations.length === 0) {
        server.log.warn('locations.json is empty, skipping seed');
        return;
    }

    await collection.bulkWrite(
        locations.map((location) => ({
            updateOne: {
                filter: { id: location.id },
                update: { $set: location },
                upsert: true,
            },
        })),
        { ordered: false }
    );

    server.log.info({ count: locations.length }, 'Locations seed completed');
};


export {
    seedLocations,
};
