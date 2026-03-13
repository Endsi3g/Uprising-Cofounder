$ErrorActionPreference = "Stop"

# ══════════════════════════════════════════════════════════════
#  UPRISING COFOUNDER — Script de Déploiement
# ══════════════════════════════════════════════════════════════

function Write-Banner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║       UPRISING COFOUNDER — DÉPLOIEMENT              ║" -ForegroundColor Cyan
    Write-Host "╠══════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "║  1. Local Docker  (Ollama — modèle local)           ║" -ForegroundColor White
    Write-Host "║  2. Local Docker  (Groq)                            ║" -ForegroundColor White
    Write-Host "║  3. Local Docker  (OpenRouter)                      ║" -ForegroundColor White
    Write-Host "║  4. Render.com    (déploiement cloud)               ║" -ForegroundColor White
    Write-Host "║  Q. Quitter                                         ║" -ForegroundColor DarkGray
    Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Ensure-EnvFile {
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Host "📋 .env créé depuis .env.example" -ForegroundColor Yellow
        } else {
            New-Item ".env" -ItemType File | Out-Null
            Write-Host "📋 .env vide créé" -ForegroundColor Yellow
        }
    }
}

function Set-EnvVar {
    param([string]$Key, [string]$Value)
    $envPath = ".env"
    $content = Get-Content $envPath -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content) { $content = "" }

    if ($content -match "(?m)^${Key}=.*$") {
        $content = $content -replace "(?m)^${Key}=.*$", "${Key}=${Value}"
    } else {
        $content += "`n${Key}=${Value}"
    }
    Set-Content $envPath $content -NoNewline
}

function Get-EnvVar {
    param([string]$Key)
    if (Test-Path ".env") {
        $line = Get-Content ".env" | Where-Object { $_ -match "^${Key}=" } | Select-Object -First 1
        if ($line) { return ($line -split "=", 2)[1].Trim('"') }
    }
    return ""
}

function Deploy-LocalDocker {
    param([string]$Provider)

    Write-Host ""
    Write-Host "🔧 Configuration du déploiement local — Provider: $Provider" -ForegroundColor Cyan

    Ensure-EnvFile

    # JWT Secret check
    $jwtSecret = Get-EnvVar "JWT_SECRET"
    if (-not $jwtSecret -or $jwtSecret -eq "CHANGE_ME_TO_A_RANDOM_64_CHAR_STRING") {
        $newSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
        Set-EnvVar "JWT_SECRET" $newSecret
        Write-Host "🔐 JWT_SECRET généré automatiquement" -ForegroundColor Green
    }

    # Set LLM provider
    Set-EnvVar "LLM_PROVIDER" $Provider

    switch ($Provider) {
        "groq" {
            $current = Get-EnvVar "GROQ_API_KEY"
            if (-not $current) {
                $apiKey = Read-Host "🔑 Entrez votre GROQ_API_KEY (https://console.groq.com)"
                Set-EnvVar "GROQ_API_KEY" $apiKey
            } else {
                Write-Host "✅ GROQ_API_KEY déjà configuré" -ForegroundColor Green
            }
        }
        "openrouter" {
            $current = Get-EnvVar "OPENROUTER_API_KEY"
            if (-not $current) {
                $apiKey = Read-Host "🔑 Entrez votre OPENROUTER_API_KEY (https://openrouter.ai)"
                Set-EnvVar "OPENROUTER_API_KEY" $apiKey
            } else {
                Write-Host "✅ OPENROUTER_API_KEY déjà configuré" -ForegroundColor Green
            }
            $model = Get-EnvVar "OPENROUTER_MODEL"
            if (-not $model) {
                $model = Read-Host "🤖 Modèle OpenRouter (Entrée = mistralai/mixtral-8x7b-instruct)"
                if (-not $model) { $model = "mistralai/mixtral-8x7b-instruct" }
                Set-EnvVar "OPENROUTER_MODEL" $model
            }
        }
        "local" {
            Write-Host "🦙 Ollama sera démarré automatiquement dans le conteneur Docker" -ForegroundColor Yellow
            $ollamaModel = Get-EnvVar "OLLAMA_MODEL"
            if (-not $ollamaModel) {
                Set-EnvVar "OLLAMA_MODEL" "llama3"
            }
        }
    }

    # Set local URLs
    Set-EnvVar "APP_URL" "http://localhost:3000"
    Set-EnvVar "CORS_ORIGIN" "http://localhost"
    Set-EnvVar "NODE_ENV" "development"

    Write-Host ""
    Write-Host "🐳 Construction des images Docker..." -ForegroundColor Cyan
    docker compose build

    Write-Host "🚀 Démarrage des services..." -ForegroundColor Cyan
    docker compose up -d

    Write-Host ""
    Write-Host "⏳ Attente de l'initialisation des services..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8

    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✅ Déploiement local réussi!                       ║" -ForegroundColor Green
    Write-Host "║                                                      ║" -ForegroundColor Green
    Write-Host "║  🌐 Frontend : http://localhost:80                   ║" -ForegroundColor Green
    Write-Host "║  🔧 Backend  : http://localhost:3000                 ║" -ForegroundColor Green
    if ($Provider -eq "local") {
    Write-Host "║  🦙 Ollama   : http://localhost:11434                ║" -ForegroundColor Green
    }
    Write-Host "║                                                      ║" -ForegroundColor Green
    Write-Host "║  📋 Logs : docker compose logs -f                   ║" -ForegroundColor DarkGray
    Write-Host "║  🛑 Stop : docker compose down                      ║" -ForegroundColor DarkGray
    Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Green
}

function Deploy-Render {
    Write-Host ""
    Write-Host "☁️  Déploiement sur Render.com" -ForegroundColor Cyan

    if (-not (Test-Path "render.yaml")) {
        Write-Host "❌ render.yaml introuvable! Assurez-vous d'être dans le bon répertoire." -ForegroundColor Red
        return
    }

    Write-Host "✅ render.yaml trouvé" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Instructions de déploiement Render.com:" -ForegroundColor Cyan
    Write-Host "   1. Connectez-vous à https://dashboard.render.com" -ForegroundColor White
    Write-Host "   2. Cliquez 'New +' → 'Blueprint'" -ForegroundColor White
    Write-Host "   3. Connectez votre repo GitHub" -ForegroundColor White
    Write-Host "   4. Render détectera render.yaml automatiquement" -ForegroundColor White
    Write-Host "   5. Configurez les variables d'env dans le dashboard Render:" -ForegroundColor White
    Write-Host "      • GEMINI_API_KEY  (ou GROQ_API_KEY / OPENROUTER_API_KEY)" -ForegroundColor DarkGray
    Write-Host "      • JWT_SECRET" -ForegroundColor DarkGray
    Write-Host "      • LLM_PROVIDER" -ForegroundColor DarkGray
    Write-Host ""

    # Check if render CLI is installed
    $renderCli = Get-Command render -ErrorAction SilentlyContinue
    if ($renderCli) {
        $deploy = Read-Host "🚀 Lancer 'render deploy' maintenant? (O/n)"
        if ($deploy -ne "n" -and $deploy -ne "N") {
            render deploy
        }
    } else {
        Write-Host "💡 Pour déployer via CLI: npm install -g @render-oss/cli && render deploy" -ForegroundColor Yellow
        Write-Host "   Ou utilisez le dashboard web Render.com (méthode recommandée)" -ForegroundColor Yellow
    }
}

# ── Main ──────────────────────────────────────────────────────────────────────

Set-Location $PSScriptRoot

Write-Banner

$choice = Read-Host "Votre choix"

switch ($choice.ToUpper()) {
    "1" { Deploy-LocalDocker -Provider "local" }
    "2" { Deploy-LocalDocker -Provider "groq" }
    "3" { Deploy-LocalDocker -Provider "openrouter" }
    "4" { Deploy-Render }
    "Q" { Write-Host "Au revoir!" -ForegroundColor DarkGray; exit 0 }
    default {
        Write-Host "❌ Choix invalide. Relancez le script." -ForegroundColor Red
        exit 1
    }
}
