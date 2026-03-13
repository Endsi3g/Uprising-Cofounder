#!/bin/bash

set -e

LLM_PROVIDER="${LLM_PROVIDER:-gemini}"

if [ "$LLM_PROVIDER" = "local" ]; then
  echo "🦙 LLM_PROVIDER=local — Démarrage d'Ollama..."

  # Start Ollama in the background
  ollama serve &

  echo "Attente d'Ollama..."
  until curl -s http://localhost:11434/api/tags > /dev/null; do
      sleep 1
  done
  echo "✅ Ollama est prêt!"

  # Pull default model
  MODEL="${OLLAMA_MODEL:-llama3}"
  echo "📥 Téléchargement du modèle $MODEL si nécessaire..."
  ollama pull "$MODEL" || true
else
  echo "☁️  LLM_PROVIDER=${LLM_PROVIDER} — Ollama ignoré (utilisation du provider cloud)"
fi

echo "🚀 Démarrage du serveur backend..."
npm start
