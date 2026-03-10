# Script de Lancement Local — Uprising Cofounder
# Ce script prépare l'environnement et lance le Frontend et le Backend SANS Docker.

$ErrorActionPreference = "Stop"
$ProjectRoot = Get-Location

Write-Host "`n--- 🚀 Préparation d'Uprising Cofounder (Mode Local) ---" -ForegroundColor Cyan

# 1. Vérification du fichier .env
if (-not (Test-Path "$ProjectRoot\.env")) {
    Write-Host "[!] Fichier .env manquant. Création à partir de .env.example..." -ForegroundColor Yellow
    Copy-Item "$ProjectRoot\.env.example" "$ProjectRoot\.env"
    Write-Host "[+] .env créé. IMPORTANT: Configurez votre GEMINI_API_KEY dans le fichier .env !" -ForegroundColor Green
}

# 2. Installation des dépendances
Write-Host "[*] Installation des dépendances Node.js..." -ForegroundColor Cyan
npm install

# 3. Configuration Prisma (Base de données)
Write-Host "[*] Configuration de la base de données (Prisma)..." -ForegroundColor Cyan
# Génère le client Prisma
npx prisma generate
# Synchronise le schéma avec la base de données (PostgreSQL par défaut)
# Note: Assurez-vous que votre instance PostgreSQL est lancée et accessible via DATABASE_URL
Write-Host "[i] Tentative de synchronisation de la base de données..." -ForegroundColor Gray
try {
    npx prisma db push
    Write-Host "[+] Base de données synchronisée avec succès." -ForegroundColor Green
} catch {
    Write-Host "[!] Échec de la synchronisation DB. Vérifiez votre DATABASE_URL dans .env." -ForegroundColor Red
    Write-Host "[i] Si vous n'avez pas de base de données active, le serveur pourrait échouer au démarrage." -ForegroundColor Yellow
}

# 4. Vérification d'Ollama (Optionnel mais recommandé pour l'IA locale)
Write-Host "[*] Vérification de la connectivité avec Ollama (Port 11434)..." -ForegroundColor Cyan
try {
    $ollamaCheck = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -ErrorAction Stop
    Write-Host "[+] Ollama est détecté et prêt." -ForegroundColor Green
} catch {
    Write-Host "[!] Ollama n'est pas détecté. Les fonctionnalités d'IA locale ne seront pas disponibles." -ForegroundColor Yellow
    Write-Host "[i] Installez Ollama sur https://ollama.com si nécessaire." -ForegroundColor Gray
}

# 5. Lancement Conjoint (Frontend + Backend)
Write-Host "`n--- 🏁 Lancement des Services ---" -ForegroundColor Green
Write-Host "[+] Backend: http://localhost:3000" -ForegroundColor Gray
Write-Host "[+] Frontend: http://localhost:5173" -ForegroundColor Gray

# On lance le backend dans un nouveau terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev:server" -NoNewWindow:$false
# On lance le frontend dans le terminal actuel (ou un nouveau si préféré)
Write-Host "[*] Lancement du Frontend (Vite)..." -ForegroundColor Cyan
npm run dev:ui
