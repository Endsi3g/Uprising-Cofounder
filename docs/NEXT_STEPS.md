# Prochaines Étapes — Uprising Cofounder

Suite au renforcement de la sécurité et à la préparation de l'infrastructure de production, voici les étapes recommandées pour faire évoluer l'application :

## 🔒 Sécurité & Authentification

- [ ] **Vérification d'Email** : Implémenter l'envoi d'emails de confirmation lors de l'inscription pour valider l'identité des utilisateurs.
- [ ] **Réinitialisation de Mot de Passe Sécurisée** : Remplacer le système actuel par une vérification par jeton (token) envoyé par email.
- [ ] **MFA (Multi-Factor Authentication)** : Ajouter une couche de sécurité optionnelle pour les comptes administrateurs.

## 💾 Gestion des Données & Scalabilité

- [ ] **Stockage Cloud pour Images** : Migrer le stockage des images (actuellement en Base64 dans SQLite) vers un bucket S3  pour améliorer les performances de la base de données.
- [ ] **Migration vers PostgreSQL** : Si le trafic augmente, envisager de migrer de SQLite vers PostgreSQL pour une meilleure gestion de la concurrence.
- [ ] **Soft Delete** : Implémenter une colonne `deleted_at` pour permettre la récupération de données supprimées accidentellement.

## 🚀 Fonctionnalités Productivité

- [ ] **Export PDF Complet** : Permettre l'exportation de l'intégralité du projet (toutes les cartes + chat) dans un document PDF structuré.
- [ ] **Multi-projets & Équipes** : Améliorer la gestion des permissions pour permettre le partage de projets entre plusieurs utilisateurs avec différents rôles.
- [ ] **Notifications Temps Réel** : Ajouter des notifications (web ou email) lors de commentaires sur les cartes ou de mises à jour importantes.

## 📈 SEO & Marketing

- [ ] **Blog & Contenu** : Ajouter une section blog pour améliorer le SEO organique.
- [ ] **Analytics** : Intégrer un outil respectueux de la vie privée (ex: Plausible ou Umami) pour suivre le tunnel de conversion.
- [ ] **PWA (Progressive Web App)** : Rendre l'application installable sur mobile avec support hors-ligne de base.

## 🛠️ Infrastructure

- [ ] **CI/CD Pipeline** : Automatiser les tests et le déploiement via GitHub Actions.
- [ ] **Monitoring & Logs** : Mettre en place un service de centralisation des logs (ex: BetterStack ou Sentry) pour détecter les erreurs en production.
