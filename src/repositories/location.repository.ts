import { Collection, DeleteResult, ObjectId } from 'mongodb';
import { Location, LocationPostRequest } from '../types';

class LocationRepository {
    constructor(private readonly collection: Collection<Location>) {

    }

    async findById(id: string): Promise<Location | null> {
        return this.collection.findOne({ id });
    }

    async createOne(location: LocationPostRequest): Promise<Location> {
        const document: Location = {
            id: new ObjectId().toHexString(),
            ...location,
        };

        await this.collection.insertOne(document);

        return document;
    }

    async updateOne(location: Location): Promise<Location | null> {
        const { id, ...updates } = location;
        const result = await this.collection.updateOne(
            { id },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return null;
        }

        return this.findById(id);
    }

    async deleteOne(id: string): Promise<DeleteResult> {
        return await this.collection.deleteOne({ id });
    }
}

export default LocationRepository;
