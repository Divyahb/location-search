import { Type } from '@sinclair/typebox';

const LocationPostSchema = Type.Object({
    name: Type.String(),
    type: Type.String(),
    'opening-hours': Type.String(),
    image: Type.String(),
    radius: Type.Number(),
    coordinates: Type.String(),
});

const LocationSchema = Type.Object({
    id: Type.String(),
    name: Type.String(),
    type: Type.String(),
    'opening-hours': Type.String(),
    image: Type.String(),
    radius: Type.Number(),
    coordinates: Type.String(),
});

const LocationSearchResponseSchema = Type.Object({
    id: Type.String(),
    name: Type.String(),
    coordinates: Type.String(),
    distance: Type.Number(),
});


const ErrorResponseSchema = Type.Object({
    code: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    error: Type.Optional(Type.String()),
    message: Type.Optional(Type.String()),
    statusCode: Type.Optional(Type.Number()),
});


export {
    LocationSchema,
    LocationPostSchema,
    ErrorResponseSchema,
    LocationSearchResponseSchema
}
