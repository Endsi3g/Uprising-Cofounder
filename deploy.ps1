$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Uprising Cofounder Deployment..." -ForegroundColor Cyan

Write-Host "📦 Pulling latest changes from main branch..." -ForegroundColor Cyan
git checkout main
git pull origin main

Write-Host "🐳 Building Docker containers..." -ForegroundColor Cyan
docker compose build

Write-Host "🔄 Starting services..." -ForegroundColor Cyan
docker compose up -d

Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "✅ App successfully deployed!" -ForegroundColor Green
Write-Host "👉 Frontend is running on port 80 (http://localhost:80)" -ForegroundColor Green
Write-Host "👉 Backend API is running on port 3000" -ForegroundColor Green
Write-Host "👉 Ollama is running on port 11434" -ForegroundColor Green
