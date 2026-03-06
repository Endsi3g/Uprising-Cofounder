# Script de Déploiement Local — Uprising Cofounder
# Ce script automatise le build et le lancement en mode production sur le port 8080.

$ProjectRoot = Get-Location
$Port = 8080

Write-Host "--- Démarrage du Déploiement Local (Port $Port) ---" -ForegroundColor Cyan

# 1. Vérification du fichier .env
if (-not (Test-Path "$ProjectRoot\.env")) {
    Write-Host "[!] Fichier .env manquant. Copie de .env.example..." -ForegroundColor Yellow
    Copy-Item "$ProjectRoot\.env.example" "$ProjectRoot\.env"
    Write-Host "[+] .env créé. N'oubliez pas de configurer vos clés API !" -ForegroundColor Green
}

# 2. Installation des dépendances
Write-Host "[*] Installation des dépendances..." -ForegroundColor Cyan
npm install

# 3. Build du frontend
Write-Host "[*] Nettoyage et Build du frontend..." -ForegroundColor Cyan
if (Test-Path "$ProjectRoot\dist") { Remove-Item -Recurse -Force "$ProjectRoot\dist" }
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Échec du build. Abandon." -ForegroundColor Red
    exit 1
}

# 4. Lancement du serveur
Write-Host "[+] Build terminé. Lancement du serveur sur http://localhost:$Port" -ForegroundColor Green
$env:PORT = $Port
$env:NODE_ENV = "production"
$env:JWT_SECRET = if ($env:JWT_SECRET) { $env:JWT_SECRET } else { "dev-local-secret-key-12345" }

node --import tsx server.ts
