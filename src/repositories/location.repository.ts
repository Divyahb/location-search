import { randomUUID } from 'crypto';
import { Collection } from 'mongodb';
import { Location, LocationPostRequest, LocationSearchResponse, StoredLocation } from '../types';
import { buildLocationDocument } from '../lib/location-transform';


class LocationRepository {
    constructor(private readonly collection: Collection<StoredLocation>) {

    }

    async findById(id: string): Promise<Location | null> {
        const transformedLocationDocument = await this.collection.findOne({ id });
        if (!transformedLocationDocument) {
            return null;
        }
        const { visibilityBounds, cartesianCoordinates, ...locationDocument } = transformedLocationDocument;
        return locationDocument;
    }

    async createOne(location: LocationPostRequest): Promise<Location> {
        const document: Location = {
            id: randomUUID(),
            ...location,
        };

        await this.collection.insertOne(buildLocationDocument(document));

        return document;
    }

    async updateOne(location: Location): Promise<Location | null> {
        const { id, ...updates } = buildLocationDocument(location);
        const result = await this.collection.updateOne(
            { id },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return null;
        }

        return this.findById(id);
    }

    async deleteOne(id: string): Promise<Location | null> {
        const existingLocation = await this.findById(id);

        if (!existingLocation) {
            return null;
        }

        await this.collection.deleteOne({ id });

        return existingLocation;
    }

    async searchLocationsByCoordinates(x: number, y: number): Promise<LocationSearchResponse[]> {
        return this.collection.aggregate<LocationSearchResponse>([
            {
                $match: {
                    'visibilityBounds.minX': { $lte: x },
                    'visibilityBounds.maxX': { $gte: x },
                    'visibilityBounds.minY': { $lte: y },
                    'visibilityBounds.maxY': { $gte: y },
                }
            },
            {
                $addFields: {
                    distance: {
                        $sqrt: {
                            $add: [
                                {
                                    $pow: [
                                        { $subtract: ['$cartesianCoordinates.x', x] },
                                        2
                                    ]
                                },
                                {
                                    $pow: [
                                        { $subtract: ['$cartesianCoordinates.y', y] },
                                        2
                                    ]
                                }
                            ]
                        }
                    }
                }
            },
            {
                $match: {
                    $expr: {
                        $lte: ['$distance', '$radius']
                    }
                }
            },
            {
                $sort: {
                    distance: 1
                }
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    coordinates: 1,
                    distance: 1
                }
            }
        ]).toArray();
    }

}

export default LocationRepository;
