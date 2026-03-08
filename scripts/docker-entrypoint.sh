#!/bin/bash

# Start Ollama in the background
ollama serve &

# Wait for Ollama to be ready
echo "Waiting for Ollama to serve..."
until curl -s http://localhost:11434/api/tags > /dev/null; do
    sleep 1
done
echo "Ollama is ready!"

# Pull default model if needed (optional, uncomment if you want to preload)
# ollama pull llama2

# Start the Node.js application
echo "Starting backend server..."
npm start
