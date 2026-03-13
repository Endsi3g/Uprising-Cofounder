/**
 * posthog.ts
 * PostHog — Client analytics côté frontend
 *
 * Initialise PostHog avec VITE_POSTHOG_KEY et VITE_POSTHOG_HOST.
 * Capture automatiquement les pageviews et les erreurs React.
 * Désactivé gracieusement si la clé n'est pas configurée.
 */

import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST as string | undefined;

export function initPostHog(): void {
  if (!POSTHOG_KEY) {
    console.info('[PostHog] VITE_POSTHOG_KEY non défini — analytics désactivé.');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: true,         // Pageviews automatiques
    capture_pageleave: true,        // Durée sur la page
    autocapture: true,              // Clics, formulaires, etc.
    persistence: 'localStorage',
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.debug();
        console.log('[PostHog] ✅ Analytics initialisé (mode dev)');
      }
    },
  });
}

// ── Helpers exportés ───────────────────────────────────────────────────────────

export function phCapture(event: string, properties?: Record<string, unknown>): void {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

export function phIdentify(userId: string, traits?: Record<string, unknown>): void {
  if (!POSTHOG_KEY) return;
  posthog.identify(userId, traits);
}

export function phReset(): void {
  if (!POSTHOG_KEY) return;
  posthog.reset();
}

export { posthog };
