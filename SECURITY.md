# 🛡️ SECURITY.md — Guide de Sécurité d'Uprising Cofounder

Ce document détaille les mesures de sécurité implémentées dans l'application, comment les configurer, et les bonnes pratiques à suivre.

---

## 1. CORS (Cross-Origin Resource Sharing)

### Ce qui a été fait
Le middleware `cors` a été configuré pour restreindre les origines autorisées à communiquer avec l'API.

### Comment ça fonctionne
- **En développement** (`NODE_ENV !== 'production'`) : toutes les origines (`*`) sont acceptées pour faciliter le développement local.
- **En production** (`NODE_ENV === 'production'`) : seules les origines listées dans `CORS_ORIGIN` sont autorisées.

### Configuration

Dans votre fichier `.env` :
```env
CORS_ORIGIN="https://cofounder.uprisingstudio.ca"
```

Pour autoriser plusieurs origines, séparez-les par des virgules :
```env
CORS_ORIGIN="https://cofounder.uprisingstudio.ca,https://app.uprisingstudio.ca"
```

### Méthodes HTTP autorisées
`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

### En-têtes autorisés
`Content-Type`, `Authorization`

---

## 2. Content Security Policy (CSP) via Helmet

### Ce qui a été fait
La CSP est activée automatiquement en production via le middleware `helmet`. Elle empêche l'exécution de scripts et de ressources non autorisées, bloquant les attaques XSS avancées.

### Directives configurées

| Directive | Valeur | Objectif |
|---|---|---|
| `default-src` | `'self'` | Seules les ressources du même domaine sont autorisées par défaut |
| `script-src` | `'self'`, `'unsafe-inline'`, `cdn.jsdelivr.net` | Scripts locaux et CDN approuvés |
| `style-src` | `'self'`, `'unsafe-inline'`, `fonts.googleapis.com` | Styles locaux et Google Fonts |
| `img-src` | `'self'`, `data:`, `https:`, `http:` | Images locales et distantes |
| `connect-src` | `'self'` + origines CORS | API et WebSocket autorisés |
| `font-src` | `'self'`, `fonts.gstatic.com` | Polices locales et Google Fonts |
| `object-src` | `'none'` | Bloque les plugins (Flash, Java, etc.) |
| `frame-src` | `'none'` | Bloque les iframes |

### Personnalisation
Si vous utilisez des services tiers supplémentaires (ex: Stripe.js, Google Analytics), ajoutez leurs domaines dans les directives correspondantes dans `server/index.ts`.

---

## 3. Validation des Entrées avec Zod

### Ce qui a été fait
Toutes les routes API qui acceptent des données utilisateur (`req.body`) utilisent désormais des schémas de validation **Zod** stricts.

### Endpoints protégés

| Route | Schéma | Règles |
|---|---|---|
| `POST /api/auth/register` | `registerSchema` | Email valide, mot de passe >= 8 caractères |
| `POST /api/auth/login` | `loginSchema` | Email valide, mot de passe non vide |
| `POST /api/auth/login-mfa` | `mfaLoginSchema` | UUID valide, code à 6 chiffres |
| `POST /api/auth/verify-email` | `tokenSchema` | Token non vide |
| `POST /api/auth/forgot-password` | `emailSchema` | Email valide |
| `POST /api/auth/reset-password` | `resetPasswordSchema` | Token non vide, mot de passe >= 8 caractères |
| `POST /api/auth/mfa/verify-setup` | `tokenSchema` | Token non vide |
| `PUT /api/users/onboarding` | `onboardingSchema` | Nom non vide |
| `POST /api/projects` | `projectSchema` | Nom du projet non vide |
| `PUT /api/projects/:id` | `projectUpdateSchema` | Champs optionnels typés |
| `POST /api/projects/:id/cards` | `cardSchema` | Titre non vide |
| `PUT /api/cards/:id` | `cardUpdateSchema` | Champs optionnels typés |

### Comportement en cas d'erreur
Les requêtes invalides reçoivent une réponse **HTTP 400** avec un message d'erreur en français :
```json
{
  "error": "Le mot de passe doit contenir au moins 8 caractères"
}
```

---

## 4. Rate Limiting

### Configuration existante

| Groupe | Limite | Fenêtre | Routes |
|---|---|---|---|
| `authLimiter` | 20 requêtes | 15 minutes | `/api/auth/*` |
| `apiLimiter` | 100 requêtes | 1 minute | Toutes les routes API |
| `aiLimiter` | 10 requêtes | 1 minute | Routes IA (Gemini) |

---

## 5. Authentification & Mots de Passe

- **Bcrypt** : Les mots de passe sont hachés avec un coût de 12 rounds (`bcrypt.hash(password, 12)`).
- **JWT** : Les tokens sont signés avec `JWT_SECRET` et expirent après 7 jours.
- **MFA TOTP** : Authentification multi-facteurs optionnelle via l'algorithme TOTP (compatible Google Authenticator).

### Configuration requise en production
```env
JWT_SECRET="une_chaine_aleatoire_tres_longue_de_64_caracteres_minimum"
```

> ⚠️ **IMPORTANT** : L'application refusera de démarrer si `JWT_SECRET` n'est pas défini en production.

---

## 6. Sentry (Monitoring d'Erreurs)

### Backend (`server/index.ts`)
- Intégration via `@sentry/node` avec Profiling
- `tracesSampleRate: 1.0` (100% des transactions capturées)
- `profilesSampleRate: 1.0` (100% des profils capturés)

### Frontend (`src/main.tsx`)
- Intégration via `@sentry/react` avec Browser Tracing et Session Replay
- `replaysSessionSampleRate: 0.1` (10% des sessions enregistrées)
- `replaysOnErrorSampleRate: 1.0` (100% des sessions avec erreurs enregistrées)

### Configuration
```env
# Backend
SENTRY_DSN="https://votre_dsn@sentry.io/votre_project_id"

# Frontend (dans .env)
VITE_SENTRY_DSN="https://votre_dsn@sentry.io/votre_project_id"
```

---

## 7. Dépendances de Sécurité Installées

| Package | Version | Rôle |
|---|---|---|
| `helmet` | ^8.1.0 | CSP, HSTS, X-Frame-Options, etc. |
| `cors` | latest | Contrôle des origines CORS |
| `zod` | latest | Validation des schémas de données |
| `express-rate-limit` | ^8.3.0 | Limitation du débit des requêtes |
| `bcryptjs` | ^3.0.3 | Hachage des mots de passe |
| `jsonwebtoken` | ^9.0.3 | Tokens d'authentification JWT |
| `speakeasy` | ^2.0.0 | Génération de codes TOTP (MFA) |
| `compression` | ^1.8.1 | Compression des réponses HTTP |

---

## 8. Recommandations pour la Production

1. **Toujours définir `JWT_SECRET`** avec une chaîne aléatoire forte (minimum 64 caractères).
2. **Configurer `CORS_ORIGIN`** avec les domaines exacts de votre frontend.
3. **Configurer `SENTRY_DSN`** pour capturer les erreurs en temps réel.
4. **Activer HTTPS** via votre reverse proxy (Nginx, Vercel, Render, etc.).
5. **Rotation des clés** : Changez périodiquement `JWT_SECRET` et les clés d'API tierces.
6. **Limiter les logs** : Désactivez les logs détaillés en production.

---

*Document mis à jour le 12 mars 2026 — Uprising Cofounder v2.2.1*
