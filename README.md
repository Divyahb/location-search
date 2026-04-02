# Fastify Backend

Minimal Fastify backend with health check endpoint.

## Installation

npm install

## Build

npm run build

## Run

npm start

For local development with `config/.dev.env` loaded automatically:

`npm run dev`

Docker and other environments should continue providing `MONGO_URL` externally.

## MongoDB Startup Seed

On startup, the app connects to MongoDB using `MONGO_URL` and upserts the contents of `data/locations.json` into the `locations` collection.

The seed is idempotent:

- it creates a unique index on `id`
- it updates existing records by `id`
- it inserts new records when needed

## Health Check

GET /health

Returns { "status": "ok" }

## OpenAPI Schema

GET /openapi.json

Returns the OpenAPI 3.0 schema for the service.
