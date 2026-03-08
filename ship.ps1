param (
    [string]$CommitMessage = "chore: automated update and deployment"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Unified Uprising Ship Process..." -ForegroundColor Cyan

Write-Host "📦 Staging files..." -ForegroundColor Cyan
git add .

Write-Host "💾 Committing changes with message: '$CommitMessage'..." -ForegroundColor Cyan
# Check if there are changes to commit
$gitStatus = git status --porcelain
if ($gitStatus) {
    git commit -m "$CommitMessage"
}
else {
    Write-Host "⚡ No changes to commit, continuing..." -ForegroundColor Yellow
}

Write-Host "☁️ Pushing to GitHub (main)..." -ForegroundColor Cyan
git push origin main

Write-Host "🐳 Triggering local deployment..." -ForegroundColor Cyan
Write-Host "Building Docker containers..." -ForegroundColor Cyan
docker compose build

Write-Host "🔄 Starting services..." -ForegroundColor Cyan
docker compose up -d

Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "✅ App successfully shipped & deployed!" -ForegroundColor Green
Write-Host "👉 Frontend: http://localhost:80" -ForegroundColor Green
Write-Host "👉 Backend API: http://localhost:3000" -ForegroundColor Green
Write-Host "👉 Ollama: http://localhost:11434" -ForegroundColor Green
