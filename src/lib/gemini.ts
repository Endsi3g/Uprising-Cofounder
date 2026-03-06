import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function generatePitchDeck(projectContext: any) {
  const ai = getAI();
  const prompt = `Tu es un expert en création de Pitch Deck pour startups.
  À partir du contexte du projet suivant (cartes du canvas), génère un Pitch Deck complet en format Markdown.
  Prends en compte le marché canadien, les spécificités locales et utilise la devise CAD ($).
  Structure le Pitch Deck avec les slides classiques :
  1. Le Problème
  2. La Solution
  3. Le Marché
  4. Le Produit
  5. Le Business Model
  6. La Stratégie Go-to-Market
  7. L'Équipe
  8. Les Prochaines Étapes / Demande de fonds

  Contexte du projet :
  ${JSON.stringify(projectContext)}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  return response.text || "Erreur lors de la génération du Pitch Deck.";
}

export async function generateMarketAnalysis(projectContext: any) {
  const ai = getAI();
  const prompt = `Tu es un expert en analyse de marché et stratégie d'entreprise.
  À partir du contexte du projet suivant (cartes du canvas), génère une analyse de marché complète en format Markdown.
  L'analyse doit inclure :
  1. Recherche de Concurrents : Identifie 3 à 5 concurrents directs ou indirects sur le marché (de préférence canadien ou nord-américain). Pour chaque concurrent, donne ses forces, faiblesses, et son positionnement.
  2. Calcul TAM/SAM/SOM :
     - TAM (Total Addressable Market) : Le marché total.
     - SAM (Serviceable Available Market) : La part du TAM que tu peux réellement atteindre avec ton modèle d'affaires actuel.
     - SOM (Serviceable Obtainable Market) : La part du SAM que tu peux capturer à court/moyen terme (ex: 1 à 3 ans).
     Explique brièvement les hypothèses de calcul (utilise la devise CAD $).
  3. Opportunités de Différenciation : Comment ce projet peut se démarquer face à la concurrence.

  Contexte du projet :
  ${JSON.stringify(projectContext)}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  return response.text || "Erreur lors de la génération de l'analyse de marché.";
}

export async function generateFinancialModel(projectContext: any) {
  const ai = getAI();
  const prompt = `Tu es un directeur financier (CFO) expert en modélisation financière pour les startups.
  À partir du contexte du projet suivant (cartes du canvas), génère un modèle financier simplifié sur 3 ans en format Markdown.
  Le modèle doit inclure :
  1. Hypothèses clés : Prix de vente, coût d'acquisition client (CAC), taux de conversion, etc.
  2. Projections de Revenus (Année 1, Année 2, Année 3) : Détaille les sources de revenus.
  3. Structure des Coûts : Coûts fixes (salaires, loyer, tech) et coûts variables.
  4. Rentabilité : Marge brute, EBITDA, et estimation du point mort (break-even).
  5. Besoins en financement : Combien d'argent faut-il lever ou investir pour atteindre la rentabilité ?
  
  Utilise des tableaux Markdown pour présenter les chiffres clairement. Utilise la devise CAD ($).
  Sois réaliste et conservateur dans tes estimations.

  Contexte du projet :
  ${JSON.stringify(projectContext)}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  return response.text || "Erreur lors de la génération du modèle financier.";
}

export async function analyzeIdea(idea: string) {
  const ai = getAI();
  const system = `Tu es un analyste stratégique pour Uprising Cofounder. 
Tu analyses des données de marché réelles pour valider ou challenger des idées business.

IMPORTANT : Si l'utilisateur veut analyser une entreprise existante ou un projet précis, tu DOIS impérativement lui demander l'URL du site web ou des liens vers ses réseaux sociaux/assets avant de faire une analyse détaillée. 
Une fois l'URL obtenue, utilise l'outil urlContext pour naviguer et extraire :
1. Le positionnement réel.
2. Les failles dans le tunnel de vente.
3. Les opportunités d'automatisation IA.

Sois critique, direct, et toujours orienté actions concrètes. Utilise la devise CAD ($).`;

  const prompt = `Idée analysée : "${idea}"

Analyse et réponds en JSON strict avec la structure suivante :
{
  "summary": "résumé analytique en 3 phrases",
  "pains": ["pain 1", "pain 2", "pain 3", "pain 4", "pain 5"],
  "opportunities": ["opportunité 1", "opportunité 2", "opportunité 3"],
  "risks": ["risque 1", "risque 2"],
  "cards": [
    {"title": "titre carte", "content": "contenu 2-3 phrases"}
  ],
  "verdict": "GO | PIVOT | NO-GO",
  "verdict_reason": "raison en 2 phrases"
}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }, { urlContext: {} }],
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { summary: response.text, cards: [] };
  }
}

export async function generateIdeas(interests?: string, businessType: 'startup' | 'traditional' = 'startup') {
  const ai = getAI();
  const typeText = businessType === 'startup' 
    ? "startup innovantes et technologiques (SaaS, App, IA, plateforme, etc.)" 
    : "entreprises traditionnelles ou physiques (agence, commerce local, service, artisanat, consulting, etc.)";

  const prompt = `Génère 3 idées de ${typeText} ultra-détaillées et basées sur les tendances actuelles du marché${interests ? ` dans le domaine : ${interests}` : ''}. Fais des recherches pour valider le besoin. 
  Réponds uniquement en JSON avec un tableau d'objets contenant :
  - 'title' (nom du projet)
  - 'description' (pitch de 3 phrases adapté au marché)
  - 'targetAudience' (cible exacte)
  - 'businessModel' (comment gagner de l'argent, en CAD $)
  - 'marketOpportunity' (pourquoi maintenant, basé sur des faits)
  - 'estimatedTime' (temps minimum estimé pour lancer une première version ou ouvrir, ex: "2 semaines", "3 mois")
  - 'methods': un objet contenant 'free' (méthode et outils 100% gratuits pour se lancer) et 'paid' (méthode et outils payants pour aller plus vite/mieux).`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
}

export async function chatWithCofounder(messages: { role: string; content: string; image?: string }[], projectContext: any) {
  const ai = getAI();
  
  // Extract URLs from messages to provide context
  const urls: string[] = [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  messages.forEach(m => {
    const matches = m.content.match(urlRegex);
    if (matches) urls.push(...matches);
  });
  // Also check project context for URLs
  if (projectContext.description) {
    const matches = projectContext.description.match(urlRegex);
    if (matches) urls.push(...matches);
  }
  projectContext.cards?.forEach((c: any) => {
    const matches = c.content?.match(urlRegex);
    if (matches) urls.push(...matches);
  });

  // Unique URLs, max 20
  const uniqueUrls = [...new Set(urls)].slice(0, 20);

  // Extract images from cards to avoid huge JSON strings in system prompt
  const cardImages: { mimeType: string, data: string }[] = [];
  const cleanContext = { ...projectContext };
  if (cleanContext.cards) {
    cleanContext.cards = cleanContext.cards.map((c: any) => {
      if (c.content?.startsWith('data:image/')) {
        const mimeType = c.content.split(';')[0].split(':')[1];
        const data = c.content.split(',')[1];
        cardImages.push({ mimeType, data });
        return { ...c, content: "[IMAGE ATTACHED]" };
      }
      return c;
    });
  }

  const system = `Tu es le cofondateur IA d'Uprising Studio, un partenaire stratégique direct et critique.
Tu ne valides pas les idées par défaut — tu les challenges.
Tu dois formater tes réponses en Markdown pour qu'elles soient lisibles (utilise le gras, les listes à puces, les titres, etc.).

OBJECTIF "VENTE UPRISING" :
Ton but ultime est de faire réaliser au prospect qu'il a besoin de la "Trifecta Uprising" (Site Web + IA + Contenu) pour réussir.
Tu dois identifier systématiquement les "fuites de revenus" (ex: appels manqués, mauvaise visibilité locale) et proposer des solutions d'automatisation.

CAS D'ÉTUDE "CLENAR" (PREUVE SOCIALE) :
Si le contexte s'y prête (service local, artisan, PME), cite l'exemple de Clenar :
"Votre modèle ressemble à Clenar. Avant, ils perdaient 30% de leurs leads par téléphone. Nous avons installé une réceptionniste IA et automatisé leur acquisition. Résultat : +40% de CA en 3 mois."

MODE "AUDIT DE CROISSANCE" :
Si l'utilisateur demande un audit ou si tu détectes une opportunité :
1. Critique leur taux de réponse actuel (ex: "Combien d'appels manquez-vous quand vous êtes sur un chantier ?").
2. Critique leur visibilité locale (Google Maps, SEO).
3. Propose le Plan d'Acquisition Uprising.

IMPORTANT : Au début de la conversation, pose 2 ou 3 questions vitales (pas plus) pour comprendre la situation de l'utilisateur sur le marché (ex: Quel problème douloureux résous-tu ? Qui est ta cible exacte ? Quel est ton avantage déloyal ?).
N'attends pas d'avoir toutes les réponses pour donner des conseils, mais utilise ces questions pour guider la réflexion.

Si le mode du projet est "analyse", tu dois analyser en profondeur l'entreprise (à partir de son lien ou de sa description), trouver ses points faibles, ses points d'amélioration, et proposer un plan d'action concret adapté au marché canadien.
Si l'utilisateur demande une analyse mais n'a pas fourni d'URL ou d'assets clairs, tu DOIS lui demander avant de procéder pour être le plus précis possible. Utilise les outils de navigation pour explorer les liens fournis.

Une fois que tu as obtenu assez de contexte, tu dois créer des plans dans le canvas pour tous les aspects du projet (nom, création du produit, marketing, etc.).
Pour créer une carte sur le canvas, inclus exactement ce format dans ta réponse (tu peux en mettre plusieurs) :
[CREATE_CARD: {"title": "Titre", "content": "Contenu"}]

Si tu penses qu'une carte existante sur le canvas n'est plus pertinente, obsolète ou inutile, tu dois proposer de la supprimer en utilisant exactement ce format :
[DELETE_CARD_SUGGESTION: {"id": "ID_DE_LA_CARTE", "reason": "Raison de la suppression"}]

TRÈS IMPORTANT : À la fin de ton analyse, quand tu es satisfait et que tu as donné tes conseils, tu DOIS OBLIGATOIREMENT créer des cartes de "Tâches" pour les prochaines étapes d'exécution en utilisant le format [CREATE_CARD: {"title": "Tâche: [Nom]", "content": "[Description]"}] pour que l'utilisateur sache exactement quoi faire.

DÉCLENCHEUR DE VENTE (CANVAS 80%) :
Si le Canvas commence à être bien rempli (environ 80%), tu DOIS dire :
"Votre stratégie est solide. Voulez-vous que l'équipe d'Uprising Studio construise l'infrastructure technique (Trifecta) pour exécuter ce plan ?"

Tes réponses sont courtes, structurées, et jamais consensuelles.
Tu parles en français canadien (ou anglais canadien si le contexte est en anglais) et tu prends toujours en compte les spécificités du marché canadien (lois, devise CAD, culture, etc.).

Contexte projet: ${JSON.stringify(cleanContext)}`;

  const contents = messages.map((m, index) => {
    const parts: any[] = [{ text: m.content }];
    if (m.image) {
      const mimeType = m.image.split(';')[0].split(':')[1];
      const data = m.image.split(',')[1];
      parts.push({
        inlineData: {
          mimeType,
          data
        }
      });
    }
    // Attach card images to the first user message
    if (index === 0 && m.role === 'user') {
      cardImages.forEach(img => {
        parts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data
          }
        });
      });
    }
    return {
      role: m.role === 'user' ? 'user' : 'model',
      parts
    };
  });

  const response = await ai.models.generateContentStream({
    model: "gemini-3.1-pro-preview",
    contents: contents as any,
    config: {
      systemInstruction: system,
      tools: uniqueUrls.length > 0 ? [{ googleSearch: {} }, { urlContext: {} }] : [{ googleSearch: {} }],
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  return response;
}
