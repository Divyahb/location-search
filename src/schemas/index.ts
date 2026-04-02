import { Type } from '@sinclair/typebox';

const LocationPostSchema = Type.Object({
    name: Type.String(),
    type: Type.String(),
    'opening-hours': Type.String(),
    image: Type.String(),
    radius: Type.Number(),
    coordinates: Type.String(),
})

const LocationSchema = Type.Object({
    id: Type.String(),
    name: Type.String(),
    type: Type.String(),
    'opening-hours': Type.String(),
    image: Type.String(),
    radius: Type.Number(),
    coordinates: Type.String(),
})

const ErrorResponseSchema = Type.Object({
    code: Type.Number(),
    message: Type.String()
});

export { LocationSchema, LocationPostSchema, ErrorResponseSchema }