// Client-side AI API proxy — all AI calls go through the server
// The Gemini API key is NEVER exposed to the client.

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export async function generatePitchDeck(projectContext: any): Promise<string> {
  const res = await fetch('/api/ai/pitch-deck', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ projectContext }),
  });
  if (!res.ok) throw new Error('Erreur lors de la génération du Pitch Deck.');
  const data = await res.json();
  return data.content;
}

export async function generateMarketAnalysis(projectContext: any): Promise<string> {
  const res = await fetch('/api/ai/market-analysis', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ projectContext }),
  });
  if (!res.ok) throw new Error("Erreur lors de la génération de l'analyse de marché.");
  const data = await res.json();
  return data.content;
}

export async function generateFinancialModel(projectContext: any): Promise<string> {
  const res = await fetch('/api/ai/financial-model', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ projectContext }),
  });
  if (!res.ok) throw new Error('Erreur lors de la génération du modèle financier.');
  const data = await res.json();
  return data.content;
}

export async function analyzeIdea(idea: string) {
  const res = await fetch('/api/ai/analyze-idea', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ idea }),
  });
  if (!res.ok) throw new Error("Erreur lors de l'analyse de l'idée.");
  return res.json();
}

export async function generateIdeas(interests?: string, businessType: 'startup' | 'traditional' = 'startup') {
  const res = await fetch('/api/ai/generate-ideas', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ interests, businessType }),
  });
  if (!res.ok) throw new Error("Erreur lors de la génération d'idées.");
  return res.json();
}

/**
 * Chat with the AI cofounder via Server-Sent Events (streaming).
 * Returns an async iterable that yields text chunks.
 */
export async function chatWithCofounder(
  messages: { role: string; content: string; image?: string }[],
  projectContext: any
): Promise<AsyncIterable<{ text: string }>> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ messages, projectContext }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la communication avec l'IA.");
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  return {
    [Symbol.asyncIterator]() {
      return {
        async next() {
          const { done, value } = await reader.read();
          if (done) return { done: true, value: undefined };

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n').filter(line => line.startsWith('data: '));

          let combinedText = '';
          for (const line of lines) {
            const data = line.slice(6); // Remove 'data: '
            if (data === '[DONE]') {
              return { done: true, value: undefined };
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) combinedText += parsed.text;
            } catch {
              // Skip malformed lines
            }
          }

          if (combinedText) {
            return { done: false, value: { text: combinedText } };
          }
          // If no text extracted from this chunk, try next
          return this.next();
        }
      };
    }
  };
}
