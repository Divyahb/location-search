#!/bin/bash

# Startup script: Docker-based MongoDB + npm install + app start (OS-agnostic)

echo "Starting MongoDB and Fastify app containers..."
docker-compose up --build
