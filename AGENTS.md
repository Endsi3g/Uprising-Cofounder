# AGENTS.md

Documentation des agents IA et des services d'automatisation d'**Uprising Cofounder**.

## 1. Cofounder IA (Gemini)
**Localisation**: `server/services/aiService.ts`
**Modèle**: `gemini-1.5-pro` (ou version supérieure selon configuration)

L'agent principal qui agit comme un partenaire stratégique pour l'utilisateur.
- **Pitch Deck**: Génération de présentations structurées basées sur le contexte du projet.
- **Analyse de Marché**: Recherche en temps réel (via Google Search) des concurrents et calcul du TAM/SAM/SOM en CAD ($).
- **Modélisation Financière**: Projections sur 3 ans et calcul de rentabilité.
- **Audit de Croissance**: Analyse critique des tunnels de vente et identification des opportunités d'automatisation.

## 2. Bland AI Service
**Localisation**: `server/services/blandService.ts`

Service spécialisé dans l'automatisation de la voix pour les appels entrants et sortants.
- **Réceptionniste IA**: Gestion des appels manqués pour les entreprises locales.
- **Qualification de Leads**: Appels automatiques pour qualifier les opportunités avant injection dans le CRM.

## 3. ElevenLabs Service
**Localisation**: `server/services/elevenLabsService.ts`

Fournit une synthèse vocale (TTS) de haute qualité pour les interactions personnalisées ou les démos de produits.

## 4. Twilio Service
**Localisation**: `server/services/twilioService.ts`

Infrastructure pour l'envoi de SMS et le routage des appels téléphoniques, permettant une communication fluide entre les agents IA et les clients finaux.

## 5. Twenty CRM Integration
**Localisation**: `server/services/twentyService.ts`

Synchronisation des leads et des opportunités générées par les agents IA vers le CRM Twenty pour un suivi structuré par l'équipe d'Uprising Studio.

---

*Note: Ce projet est optimisé pour le marché canadien avec un support complet de la devise CAD ($) et des spécificités locales.*
