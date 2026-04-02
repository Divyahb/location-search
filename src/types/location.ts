type Location = {
    'name': string;
    'type': string;
    'id': string;
    'opening-hours': string;
    'image': string;
    'radius': number;
    'coordinates': string;
}

type LocationPostRequest = {
    'name': string;
    'type': string;
    'opening-hours': string;
    'image': string;
    'radius': number;
    'coordinates': string;
}

type CartesianCoordinates = {
    x: number;
    y: number;
}

type VisibilityBounds = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}


type TransformedLocation = Location & {
    cartesianCoordinates: CartesianCoordinates;
    visibilityBounds: VisibilityBounds;
}

type LocationSearchResponse = {
    id: string;
    name: string;
    coordinates: string;
    distance: number
}

export { Location, TransformedLocation, LocationSearchResponse, LocationPostRequest, CartesianCoordinates, VisibilityBounds }