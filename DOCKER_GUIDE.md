# 🐳 Guide d'utilisation Docker — Uprising Cofounder

Ce guide explique comment compiler et lancer l'infrastructure complète d'Uprising Cofounder en utilisant Docker.

## 🏗️ Architecture Docker

Le projet utilise `docker-compose` pour orchestrer trois services principaux :
1.  **db**: Base de données PostgreSQL stable.
2.  **backend**: Serveur Node.js (Express) + Instance locale d'Ollama.
3.  **frontend**: Serveur Nginx servant l'application React buildée.

## 🚀 Démarrage Rapide

### 1. Configuration de l'environnement
Assurez-vous d'avoir un fichier `.env` à la racine :
```env
GEMINI_API_KEY="votre_cle_ici"
JWT_SECRET="une_chaine_aleatoire_tres_longue"
# Les ports par défaut sont 3000 (API), 80 (Web), 11434 (Ollama)
```

### 2. Build & Launch
Utilisez les commandes standard ou le script de déploiement :
```powershell
# Via le script automatisé
.\deploy.ps1

# Ou manuellement
docker compose build
docker compose up -d
```

## 🛠️ Commandes Utiles

- **Voir les logs**: `docker compose logs -f`
- **Arrêter les services**: `docker compose down`
- **Réinitialiser la base de données**: `docker compose down -v` (Attention: Supprime les données).
- **Entrer dans le container backend**: `docker exec -it uprising-backend /bin/bash`

## 🧠 Note sur Ollama
L'image backend installe automatiquement Ollama. Au premier démarrage, il peut être nécessaire de télécharger manuellement un modèle si vous ne l'avez pas configuré en auto-pull :
```bash
docker exec -it uprising-backend ollama pull llama3.1
```

## ❓ Dépannage (Troubleshooting)

- **Port 80 déjà utilisé**: Modifiez le port dans `docker-compose.yml` sous le service `frontend`.
- **Erreur de connexion DB**: Le backend attend que la DB soit "healthy". Si cela échoue, vérifiez les logs du container `uprising-db`.
- **Mémoire**: Ollama peut être gourmand en RAM. Assurez-vous que Docker dispose d'au moins 4GB à 8GB de RAM allouée.

---
*Documentation générée pour Uprising Cofounder.*
