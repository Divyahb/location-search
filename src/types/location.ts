export type Location = {
    id: string;
    name: string;
    type: string;
    'opening-hours': string;
    image: string;
    radius: number;
    coordinates: string;
};

export type LocationPostRequest = Omit<Location, 'id'>;

export type CartesianCoordinates = {
    x: number;
    y: number;
};

export type VisibilityBounds = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
};

export type StoredLocation = Location & {
    cartesianCoordinates: CartesianCoordinates;
    visibilityBounds: VisibilityBounds;
};

export type LocationSearchResponse = {
    id: string;
    name: string;
    coordinates: string;
    distance: number;
};
