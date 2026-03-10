# GEMINI.md

Ce document fournit le contexte technique et les directives pour les agents basés sur Gemini (comme Antigravity) travaillant sur le dépôt **Uprising Cofounder**.

## Aperçu du Projet

**Uprising Cofounder** est une plateforme d'IA conçue pour aider les entrepreneurs canadiens à valider, structurer et lancer leurs startups. Elle utilise la "Trifecta Uprising" (Site Web + IA + Contenu) pour transformer une idée en une infrastructure technique solide.

## Pile Technologique

- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion.
- **Backend**: Express, Node.js (avec `tsx` pour le développement).
- **Base de données**: Better-SQLite3, Prisma (ORM).
- **IA**: `@google/genai` (Gemini API), Bland AI, ElevenLabs.
- **Infrastructure**: Docker for local testing and deployment.

## Commandes Clés

### Développement
```powershell
npm run dev        # Lance le serveur backend (Express + TSX)
npm run dev:ui     # Lance le serveur frontend (Vite)
```

### Base de données (Prisma)
```powershell
npx prisma studio  # Interface visuelle pour la DB
npx prisma generate # Génère le client Prisma
```

## Standards de Développement

- **Langue**: L'interface utilisateur et le contenu généré par l'IA doivent être en **Français (Canada)** par défaut, utilisant la devise **CAD ($)**.
- **Architecture**:
  - Les services d'IA sont centralisés dans `server/services/`.
  - Le frontend utilise des composants modernes (shadcn/ui style) avec Tailwind 4.
- **Types**: Utilisation stricte de TypeScript. Pas de `any`.
- **Paths**: Toujours utiliser des chemins absolus lors des appels d'outils.

## Travailler avec aiService.ts

Toute la logique de génération d'IA (Gemini) se trouve dans `server/services/aiService.ts`. Les fonctionnalités incluent :
- `generatePitchDeck`
- `generateMarketAnalysis` (avec Google Search)
- `generateFinancialModel`
- `chatWithCofounder` (Mode stratégique direct et critique)

## Objectif "Vente Uprising"

L'agent (Cofounder IA) ne doit pas seulement être utile, il doit être un **vendeur**. Son but ultime est de faire réaliser à l'utilisateur qu'il a besoin de l'expertise d'Uprising Studio pour exécuter son plan technique.
