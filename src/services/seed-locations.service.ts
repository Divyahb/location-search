import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { FastifyInstance } from 'fastify';
import { TransformedLocation, CartesianCoordinates, VisibilityBounds, Location } from '../types';

const LOCATIONS_COLLECTION = 'locations';
const DEFAULT_LOCATIONS_PATH = path.resolve(process.cwd(), 'data', 'locations.json');

const parseCoordinates = (coordinateString: string): CartesianCoordinates => {
    const match = coordinateString.match(/^x=(\d+),y=(\d+)$/);

    if (!match) {
        throw new Error(`Invalid coordinates format: ${coordinateString}`);
    }

    return {
        x: Number(match[1]),
        y: Number(match[2]),
    };
};

const buildVisibilityBounds = (coordinates: CartesianCoordinates, radius: number): VisibilityBounds => {
    return {
        minX: coordinates.x - radius,
        maxX: coordinates.x + radius,
        minY: coordinates.y - radius,
        maxY: coordinates.y + radius
    }
}

const buildLocationDocument = (location: Location): TransformedLocation => {

    const cartesianCoordinates = parseCoordinates(location.coordinates);

    return {
        ...location,
        cartesianCoordinates,
        visibilityBounds: buildVisibilityBounds(cartesianCoordinates, location.radius)
    }

}

const seedLocations = async (server: FastifyInstance): Promise<void> => {
    const collection = server.mongo.db?.collection<TransformedLocation>(LOCATIONS_COLLECTION);

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
            const transformedLocation: TransformedLocation = buildLocationDocument(location);
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
    buildLocationDocument
};
