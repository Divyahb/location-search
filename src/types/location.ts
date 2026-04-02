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


type TransformedLocation = Location & {
    transformedCoordinates: {
        type: "Point",
        values: [number, number]
    };
}

type LocationSearchResponse = {
    id: string;
    name: string;
    coordinates: string;
    distance: number
}

export { Location, TransformedLocation, LocationSearchResponse, LocationPostRequest }