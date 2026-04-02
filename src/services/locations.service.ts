import { Location, LocationPostRequest, LocationSearchResponse } from '../types';
import LocationRepository from '../repositories/location.repository';

class LocationService {
    constructor(private readonly locationRepository: LocationRepository) { }

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

    async searchLocationsByCoordinates(x: number, y: number): Promise<LocationSearchResponse[]> {
        return await this.locationRepository.searchLocationsByCoordinates(x, y);
    }
}

export default LocationService;
