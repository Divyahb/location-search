import { CartesianCoordinates, Location, StoredLocation, VisibilityBounds } from '../types';

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
        maxY: coordinates.y + radius,
    };
};

const buildLocationDocument = (location: Location): StoredLocation => {
    const cartesianCoordinates = parseCoordinates(location.coordinates);

    return {
        ...location,
        cartesianCoordinates,
        visibilityBounds: buildVisibilityBounds(cartesianCoordinates, location.radius),
    };
};

export {
    parseCoordinates,
    buildVisibilityBounds,
    buildLocationDocument,
};
