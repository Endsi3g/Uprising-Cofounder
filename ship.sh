#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Unified Uprising Ship Process..."

# Get commit message flag or use default
COMMIT_MSG=${1:-"chore: automated update and deployment"}

echo "📦 Staging files..."
git add .

echo "💾 Committing changes with message: '$COMMIT_MSG'..."
# Only commit if there are changes
if ! git diff-index --quiet HEAD --; then
    git commit -m "$COMMIT_MSG"
else
    echo "⚡ No changes to commit, continuing..."
fi

echo "☁️ Pushing to GitHub (main)..."
git push origin main

echo "🐳 Triggering local deployment..."
echo "Building Docker containers..."
docker compose build

echo "🔄 Starting services..."
docker compose up -d

echo "⏳ Waiting for services to initialize..."
sleep 5

echo "✅ App successfully shipped & deployed!"
echo "👉 Frontend: http://localhost:80"
echo "👉 Backend API: http://localhost:3000"
echo "👉 Ollama: http://localhost:11434"
