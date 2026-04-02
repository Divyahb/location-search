import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { FastifyInstance } from 'fastify';
import { StoredLocation, Location } from '../types';
import { buildLocationDocument } from '../lib/location-transform';

const LOCATIONS_COLLECTION = 'locations';
const DEFAULT_LOCATIONS_PATH = path.resolve(process.cwd(), 'data', 'locations.json');

const seedLocations = async (server: FastifyInstance): Promise<void> => {
    const collection = server.mongo.db?.collection<StoredLocation>(LOCATIONS_COLLECTION);

    if (!collection) {
        throw new Error('MongoDB collection is not available');
    }

    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ name: 1, coordinates: 1 }, { unique: true });
    await collection.createIndex({ 'visibilityBounds.minX': 1, 'visibilityBounds.maxX': 1, 'visibilityBounds.minY': 1, 'visibilityBounds.maxY': 1 })

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
        locations.map((location) => {
            const transformedLocation: StoredLocation = buildLocationDocument(location);
            return {
                updateOne: {
                    filter: { id: location.id },
                    update: {
                        $set: transformedLocation
                    },
                    upsert: true,
                },
            }
        }),
        { ordered: false }
    );

    server.log.info({ count: locations.length }, 'Locations seed completed');
};


export {
    seedLocations,
};
