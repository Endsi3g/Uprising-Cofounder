#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Uprising Cofounder Deployment..."

echo "📦 Pulling latest changes from main branch..."
git checkout main
git pull origin main

echo "🐳 Building Docker containers..."
docker compose build

echo "🔄 Starting services..."
docker compose up -d

echo "⏳ Waiting for services to initialize..."
sleep 5

echo "✅ App successfully deployed!"
echo "👉 Frontend is running on port 80 (http://localhost:80)"
echo "👉 Backend API is running on port 3000"
echo "👉 Ollama is running on port 11434"
