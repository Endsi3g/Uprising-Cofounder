<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Uprising Cofounder 🚀

**Plateforme IA pour entrepreneurs canadiens** — Validez, structurez et lancez votre startup avec l'aide d'un Cofounder IA stratégique.

Uprising Cofounder utilise la "Trifecta Uprising" (Site Web + IA + Contenu) pour transformer une idée en infrastructure technique solide. Interface 100% en français, devise CAD ($).

## 🛠️ Pile Technologique

| Couche | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS 4, Framer Motion |
| **Backend** | Express, Node.js, TypeScript (tsx) |
| **Base de données** | Better-SQLite3, Prisma (ORM) |
| **IA** | Google Gemini API (`@google/genai`) |
| **Sécurité** | Helmet (CSP), CORS strict, Zod (validation), Bcrypt, JWT, Rate-Limiting |
| **Monitoring** | Sentry (Frontend + Backend) |
| **Infrastructure** | Docker, Docker Compose |
| **Intégrations** | Bland AI, ElevenLabs, Twilio, Twenty CRM |

## 🚀 Démarrage Rapide

### Prérequis

- **Node.js** >= 20
- **Docker** et **Docker Compose** (optionnel, pour le déploiement conteneurisé)

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-org/uprising-cofounder.git
cd uprising-cofounder
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

Copiez le fichier `.env.example` vers `.env` et remplissez les clés requises :

```bash
cp .env.example .env
```

**Variables obligatoires :**

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Clé API Google Gemini |
| `JWT_SECRET` | Chaîne aléatoire de 64 caractères (requis en production) |

**Variables optionnelles :** voir [`.env.example`](.env.example) pour la liste complète (Twilio, Bland AI, ElevenLabs, SMTP, AWS S3, etc.)

### 4. Générer le client Prisma

```bash
npx prisma generate
```

### 5. Lancer l'application

```powershell
# Backend (Express + API)
npm run dev

# Frontend (Vite dev server, dans un second terminal)
npm run dev:ui
```

L'API est disponible sur `http://localhost:3000` et le frontend sur `http://localhost:5173`.

## 🐳 Docker

Consultez le [Guide Docker](DOCKER_GUIDE.md) pour déployer avec Docker Compose :

```powershell
docker compose build
docker compose up -d
```

## 🛡️ Sécurité

L'application intègre les mécanismes de sécurité suivants. Voir [SECURITY.md](SECURITY.md) pour les détails complets.

- **CORS restrictif** — Origines autorisées configurées via `CORS_ORIGIN`
- **Content Security Policy (CSP)** — Via Helmet, activée automatiquement en production
- **Validation stricte (Zod)** — Tous les endpoints API valident les entrées avec des schémas Zod
- **Rate Limiting** — Protection contre le brute-force sur les routes d'authentification
- **Bcrypt + JWT** — Hachage des mots de passe et authentification par token
- **MFA (TOTP)** — Authentification multi-facteurs via Speakeasy

## 📊 Monitoring

- **Sentry** — Intégré côté backend (`@sentry/node` + Profiling) et frontend (`@sentry/react` + Replay)
- Configurez `SENTRY_DSN` (backend) et `VITE_SENTRY_DSN` (frontend) dans votre `.env`

## 📜 Scripts Disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur backend (Express + TSX) |
| `npm run dev:ui` | Lance le serveur frontend (Vite) |
| `npm run build` | Build de production (Vite) |
| `npm run lint` | Vérification TypeScript (`tsc --noEmit`) |
| `npm run start:prod` | Lance en mode production |

## 📚 Documentation

- [SECURITY.md](SECURITY.md) — Détails de la configuration de sécurité
- [DOCKER_GUIDE.md](DOCKER_GUIDE.md) — Guide Docker et déploiement
- [NEXT_STEPS.md](NEXT_STEPS.md) — Feuille de route et prochaines étapes
- [CHANGELOG.md](CHANGELOG.md) — Historique des versions
- [AGENTS.md](AGENTS.md) — Documentation des agents IA

---

*Projet optimisé pour le marché canadien 🇨🇦 avec support complet de la devise CAD ($).*
