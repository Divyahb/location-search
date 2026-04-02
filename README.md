# Locations Service

TypeScript + Fastify service for managing restaurant locations stored in MongoDB.

## Libraries Used

- `fastify`: HTTP server and route registration
- `@fastify/swagger`: OpenAPI document generation
- `@fastify/swagger-ui`: Swagger UI at `/docs`
- `@fastify/mongodb`: MongoDB connection plugin for Fastify
- `@sinclair/typebox`: request/response schemas
- `typescript`: TypeScript compiler
- `ts-node`: run TypeScript directly in development and scripts
- `nodemon`: auto-reload during local development
- `dotenv-cli`: load environment files for local commands

## Project Entry Points

- Application startup: [src/server.ts](/c:/Users/divya/development/bonial/src/server.ts)
- MongoDB plugin: [src/plugins/mongodb.ts](/c:/Users/divya/development/bonial/src/plugins/mongodb.ts)
- Seed script entry: [src/scripts/seed-locations.ts](/c:/Users/divya/development/bonial/src/scripts/seed-locations.ts)
- Seed implementation: [src/services/seed-locations.service.ts](/c:/Users/divya/development/bonial/src/services/seed-locations.service.ts)
- Transformation helpers: [src/lib/location-transform.ts](/c:/Users/divya/development/bonial/src/lib/location-transform.ts)

## Environment

The application expects `MONGO_URL` to be set.

Local development uses:

- [config/.dev.env](/c:/Users/divya/development/bonial/config/.dev.env)

Production-style configuration can use:

- [config/.prod.env](/c:/Users/divya/development/bonial/config/.prod.env)

## Data Source For Seeding

Seed data lives in:

- [data/locations.json](/c:/Users/divya/development/bonial/data/locations.json)

The `locations` array from that file is read and upserted into the MongoDB `locations` collection.

## Development Setup

Install dependencies:

```bash
npm install
```

Start MongoDB with Docker:

```bash
docker compose up -d mongodb
```

Run the seed script with local env values:

```bash
npm run seed
```

Start the API in development mode:

```bash
npm run dev
```

## Production-Style Setup

Build the application:

```bash
npm run build
```

Seed the database with a production `MONGO_URL`:

```bash
dotenv -e config/.prod.env -- ts-node src/scripts/seed-locations.ts
```

Start the compiled server:

```bash
npm start
```

If your production environment injects `MONGO_URL` directly, you can skip `dotenv` and run the same commands with the environment variable provided by the platform.

## Swagger

After the app starts, Swagger UI is available at:

- `http://localhost:3000/docs`

The API is grouped with these Swagger tags:

- `health`
- `location`

## MongoDB Notes

- The app connects through `@fastify/mongodb`
- The collection name is `locations`
- MongoDB creates the collection lazily when indexes or writes are performed
- Docker Compose starts MongoDB on port `27017`
- Local dev `MONGO_URL` points to the `bonial` database

## What Happens During Pre-Seed

When `npm run seed` runs, the seed script:

1. Starts a lightweight Fastify instance only to reuse the MongoDB plugin configuration
2. Connects to MongoDB using `MONGO_URL`
3. Reads [data/locations.json](/c:/Users/divya/development/bonial/data/locations.json)
4. Transforms each location into the stored MongoDB document shape
5. Creates indexes
6. Upserts all seed records into the `locations` collection

## Transformation Done During Seed

Each raw location is converted into a stored document with extra computed fields:

- `cartesianCoordinates`
- `visibilityBounds`

Those values are built in [src/lib/location-transform.ts](/c:/Users/divya/development/bonial/src/lib/location-transform.ts).

## Why The Pre-Seed Transformation Exists

The transformation is done before querying so the API does not need to repeatedly parse coordinate strings on every request.

This helps because:

- coordinates are normalized once at write time
- query-time work is reduced
- precomputed bounds support more scalable filtering
- the stored document is better suited for location visibility queries than the raw `"x=2,y=2"` string format

## Current NPM Commands

```bash
npm run build
npm run seed
npm run dev
npm start
npm run test:e2e
```

## E2E Testing

Run the end-to-end test suite with:

```bash
npm run test:e2e
```

The current e2e tests live in:

- [src/e2e/locations.e2e.test.ts](/c:/Users/divya/development/bonial/src/e2e/locations.e2e.test.ts)

## Why `node:test` And `node:assert`

This project currently uses Node's built-in test runner and assertion library:

- `node:test`
- `node:assert`

Reasoning:

- no extra test dependency is required
- setup is minimal for a small backend service
- it works well for Fastify `inject()`-based e2e tests
- it keeps the project lightweight while the test suite is still small

`node:assert` is an older built-in Node module. `node:test` is newer than tools like Jest or Mocha, but it is an official Node test runner and is a valid choice for simple backend testing.

Jest, Mocha, or Vitest could also be used later if the project needs richer mocking, snapshots, or a more familiar test ecosystem.
