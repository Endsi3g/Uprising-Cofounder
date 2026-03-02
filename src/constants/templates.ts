import { LayoutGrid, ShoppingBag, Store, Smartphone, Briefcase } from "lucide-react";

export interface TemplateCard {
  title: string;
  content: string;
  phase: number; // 1: Problem, 2: Solution, 3: Metrics, 4: UVP, 5: Advantage, 6: Channels, 7: Segments, 8: Costs, 9: Revenue
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  cards: TemplateCard[];
}

export const TEMPLATES: Template[] = [
  {
    id: "saas",
    name: "SaaS (Software as a Service)",
    description: "Idéal pour les applications web, outils B2B et plateformes d'abonnement.",
    icon: LayoutGrid,
    cards: [
      { phase: 1, title: "Problème", content: "Processus manuels inefficaces, manque de visibilité sur les données, coûts élevés des solutions existantes." },
      { phase: 2, title: "Solution", content: "Plateforme cloud automatisée avec tableaux de bord en temps réel et intégrations API." },
      { phase: 3, title: "Métriques Clés", content: "MRR (Revenu Mensuel Récurrent), Churn Rate, CAC (Coût d'Acquisition Client), LTV (Valeur Vie Client)." },
      { phase: 4, title: "Proposition de Valeur Unique", content: "Gagnez 10 heures par semaine sur votre gestion administrative grâce à notre IA intégrée." },
      { phase: 5, title: "Avantage Déloyal", content: "Algorithme propriétaire d'optimisation, accès exclusif à des bases de données sectorielles." },
      { phase: 6, title: "Canaux", content: "LinkedIn Ads, Content Marketing (Blog/SEO), Partenariats technologiques, Cold Outreach." },
      { phase: 7, title: "Segments Clients", content: "PME du secteur logistique (10-50 employés), Directeurs Opérationnels, Responsables IT." },
      { phase: 8, title: "Structure de Coûts", content: "Hébergement AWS/Azure, Salaires développeurs, Marketing digital, Support client." },
      { phase: 9, title: "Flux de Revenus", content: "Abonnements mensuels/annuels, Frais d'implémentation, Services de consulting premium." }
    ]
  },
  {
    id: "ecommerce",
    name: "E-commerce / D2C",
    description: "Pour les boutiques en ligne, marques de produits physiques et dropshipping.",
    icon: ShoppingBag,
    cards: [
      { phase: 1, title: "Problème", content: "Difficulté à trouver des produits éco-responsables de qualité, délais de livraison trop longs, manque de transparence." },
      { phase: 2, title: "Solution", content: "Boutique en ligne curatée de produits locaux, livraison en 24h, traçabilité complète via QR code." },
      { phase: 3, title: "Métriques Clés", content: "Taux de conversion, Panier moyen (AOV), Taux de retour, Fréquence d'achat." },
      { phase: 4, title: "Proposition de Valeur Unique", content: "Le style sans compromis : 100% recyclé, 100% local, livré demain." },
      { phase: 5, title: "Avantage Déloyal", content: "Contrat d'exclusivité avec 3 artisans locaux majeurs, communauté engagée de 50k abonnés." },
      { phase: 6, title: "Canaux", content: "Instagram/TikTok Ads, Marketing d'influence, Emailing (Klaviyo), SEO local." },
      { phase: 7, title: "Segments Clients", content: "Millennials urbains (25-40 ans) soucieux de l'environnement, amateurs de design minimaliste." },
      { phase: 8, title: "Structure de Coûts", content: "Achat de stock, Packaging biodégradable, Logistique/Expédition, Publicité sociale." },
      { phase: 9, title: "Flux de Revenus", content: "Ventes directes de produits, Box par abonnement, Collaborations en édition limitée." }
    ]
  },
  {
    id: "retail",
    name: "Commerce de Détail / Physique",
    description: "Pour les magasins, restaurants, boutiques physiques et services de proximité.",
    icon: Store,
    cards: [
      { phase: 1, title: "Problème", content: "Désertification des centres-villes, manque d'expérience client en magasin, difficulté d'approvisionnement local." },
      { phase: 2, title: "Solution", content: "Concept store hybride (boutique + café), ateliers hebdomadaires, système de Click & Collect." },
      { phase: 3, title: "Métriques Clés", content: "Trafic en magasin (Footfall), Chiffre d'affaires au m², Taux de fidélité, Marge brute." },
      { phase: 4, title: "Proposition de Valeur Unique", content: "Plus qu'un magasin, un lieu de vie pour les passionnés de DIY au cœur du quartier." },
      { phase: 5, title: "Avantage Déloyal", content: "Emplacement n°1 en zone piétonne, bail commercial historique à loyer modéré." },
      { phase: 6, title: "Canaux", content: "Vitrine physique, Google My Business, Presse locale, Événements de quartier." },
      { phase: 7, title: "Segments Clients", content: "Habitants du quartier (rayon 2km), familles CSP+, touristes de passage." },
      { phase: 8, title: "Structure de Coûts", content: "Loyer et charges, Salaires personnel, Aménagement magasin, Stock initial." },
      { phase: 9, title: "Flux de Revenus", content: "Vente de marchandises, Consommations café, Frais d'inscription aux ateliers." }
    ]
  },
  {
    id: "mobile-app",
    name: "Application Mobile B2C",
    description: "Applications grand public, jeux, réseaux sociaux ou outils de productivité personnels.",
    icon: Smartphone,
    cards: [
      { phase: 1, title: "Problème", content: "Difficulté à rester concentré, surcharge d'informations, manque de motivation pour le sport." },
      { phase: 2, title: "Solution", content: "App de gamification de la productivité avec défis entre amis et récompenses réelles." },
      { phase: 3, title: "Métriques Clés", content: "DAU/MAU (Utilisateurs Actifs), Rétention J+30, Temps moyen par session, K-factor (Viralité)." },
      { phase: 4, title: "Proposition de Valeur Unique", content: "Transformez vos tâches quotidiennes en une aventure épique dont vous êtes le héros." },
      { phase: 5, title: "Avantage Déloyal", content: "Partenariat avec des marques de sport pour les récompenses, design psychologique addictif." },
      { phase: 6, title: "Canaux", content: "App Store Optimization (ASO), Publicité In-App, Viralité organique, YouTube Tech Reviewers." },
      { phase: 7, title: "Segments Clients", content: "Étudiants (18-25 ans), Jeunes actifs tech-savvy, Gamers cherchant à s'organiser." },
      { phase: 8, title: "Structure de Coûts", content: "Développement iOS/Android, Serveurs Firebase, Marketing d'acquisition, Coût des récompenses." },
      { phase: 9, title: "Flux de Revenus", content: "Modèle Freemium (Abonnement Pro), Achats In-App de cosmétiques, Publicité ciblée." }
    ]
  },
  {
    id: "service",
    name: "Agence / Service B2B",
    description: "Consulting, agences marketing, services de design ou développement freelance.",
    icon: Briefcase,
    cards: [
      { phase: 1, title: "Problème", content: "Manque d'expertise interne, besoin de résultats rapides, difficulté à recruter des talents spécialisés." },
      { phase: 2, title: "Solution", content: "Accompagnement stratégique sur-mesure avec exécution opérationnelle garantie par KPIs." },
      { phase: 3, title: "Métriques Clés", content: "Nombre de leads qualifiés, Taux de signature, Marge par projet, NPS (Satisfaction client)." },
      { phase: 4, title: "Proposition de Valeur Unique", content: "Nous doublons votre ROI marketing en 90 jours ou nous travaillons gratuitement." },
      { phase: 5, title: "Avantage Déloyal", content: "Réseau d'experts seniors ex-Google/Meta, méthodologie propriétaire testée sur 100+ clients." },
      { phase: 6, title: "Canaux", content: "Réseautage/Networking, Webinaires experts, Études de cas publiées, Recommandations (Referral)." },
      { phase: 7, title: "Segments Clients", content: "Startups en phase de Scale-up (Série A/B), E-commerçants réalisant >1M€ de CA." },
      { phase: 8, title: "Structure de Coûts", content: "Salaires consultants, Outils de prospection, Frais de déplacement, Marketing de contenu." },
      { phase: 9, title: "Flux de Revenus", content: "Forfaits mensuels (Retainers), Projets au succès, Audits ponctuels." }
    ]
  }
];
