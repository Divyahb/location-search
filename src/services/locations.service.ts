import { Location, LocationPostRequest, LocationSearchResponse } from '../types';
import LocationRepository from '../repositories/location.repository';

class LocationService {
    constructor(private readonly locationRepository: LocationRepository) { }

    async getLocations(skip: number, limit: number): Promise<Location[]> {
        return await this.locationRepository.getLocations(skip, limit);
    }

    async findById(id: string): Promise<Location | null> {
        return await this.locationRepository.findById(id);
    }

    async createLocation(location: LocationPostRequest): Promise<Location> {
        return await this.locationRepository.createOne(location);
    }

    async updateLocation(location: Location): Promise<Location | null> {
        return await this.locationRepository.updateOne(location);
    }

    async deleteLocation(id: string): Promise<Location | null> {
        return await this.locationRepository.deleteOne(id);
    }

    async searchLocationsByCoordinates(x: number, y: number, skip: number, limit: number): Promise<LocationSearchResponse[]> {
        return await this.locationRepository.searchLocationsByCoordinates(x, y, skip, limit);
    }
}

export default LocationService;
