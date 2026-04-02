#!/bin/bash

set -e

echo "Step 1: Starting MongoDB and installing dependencies in parallel..."
docker compose up -d mongodb &
DOCKER_PID=$!

npm install &
NPM_INSTALL_PID=$!

wait $DOCKER_PID
wait $NPM_INSTALL_PID

echo "Step 2: Seeding locations..."
npm run seed

echo "Step 3: Starting application..."
npm run dev
