# Guide de Déploiement — Uprising Cofounder

Ce document détaille les étapes nécessaires pour déployer l'application Uprising Cofounder en environnement de production.

## 🛠️ Pré-requis

- Node.js 18+ installé.
- Un domaine pointant vers votre serveur.
- Une clé API Google Gemini valide.
- Un certificat SSL (HTTPS est obligatoire pour les cookies sécurisés).

## 🌍 Environnement (.env)

Créez un fichier `.env` sur le serveur à partir de `.env.example`. Les variables suivantes sont **critiques** :

- `NODE_ENV=production`
- `JWT_SECRET` : Une chaîne aléatoire longue (64 caractères recommandés).
- `GEMINI_API_KEY` : Votre clé API Google.
- `CORS_ORIGIN` : L'URL de votre application (ex: `https://cofounder.uprisingstudio.ca`).
- `APP_URL` : Même valeur que `CORS_ORIGIN`.

## 📦 Installation & Build

1. Clonez le dépôt sur le serveur.
2. Installez les dépendances : `npm install`
3. Générez le build frontend : `npm run build`
4. Le dossier `/dist` sera créé et servi automatiquement par le serveur Node.js.

## 🏃 Lancement

### Avec PM2 (Recommandé)

Pour assurer la haute disponibilité de l'application :

```bash
npm install -g pm2
pm2 start server.ts --name uprising-cofounder --interpreter node --node-args="--import tsx"
```

### Directement

```bash
npm run start:prod
```

## 🛡️ Sécurité Appliquée

L'application intègre nativement :

- **Helmet.js** : Protection contre les vulnérabilités HTTP courantes.
- **Rate Limiting** :
  - Auth: 20 requêtes / 15 min.
  - API: 100 requêtes / min.
  - AI: 10 requêtes / min.
- **Compression** : Gzip activé pour toutes les réponses.
- **Input Sanitization** : Protection contre les injections XSS de base.

## 💾 Sauvegardes

Comme l'application utilise SQLite par défaut, la base de données se trouve dans le fichier `app.db`.
**Important** : Sauvegardez régulièrement ce fichier ou configurez un cron job pour le copier vers un stockage distant.
