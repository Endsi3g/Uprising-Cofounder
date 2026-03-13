/**
 * analyticsService.ts
 * PostHog Node.js — Tracking analytics côté serveur
 *
 * Capture les événements métier importants (signup, feature usage, etc.)
 * sur le backend, indépendamment du tracking frontend.
 */

import { PostHog } from 'posthog-node';

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://app.posthog.com';

let _client: PostHog | null = null;

function getClient(): PostHog | null {
  if (!POSTHOG_API_KEY) return null;
  if (_client) return _client;

  _client = new PostHog(POSTHOG_API_KEY, {
    host: POSTHOG_HOST,
    flushAt: 20,
    flushInterval: 10_000,
  });

  return _client;
}

// ── Événements prédéfinis ──────────────────────────────────────────────────────

export function trackEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
): void {
  const client = getClient();
  if (!client) return;

  client.capture({
    distinctId,
    event,
    properties: {
      ...properties,
      source: 'server',
      timestamp: new Date().toISOString(),
    },
  });
}

export function trackUserSignup(userId: string, email: string): void {
  trackEvent(userId, 'user_signed_up', { email });
}

export function trackAIGeneration(
  userId: string,
  type: 'pitch_deck' | 'market_analysis' | 'financial_model' | 'chat',
  durationMs?: number
): void {
  trackEvent(userId, 'ai_generation_requested', { type, duration_ms: durationMs });
}

export function trackJobQueued(userId: string, jobType: string, jobId: string | null): void {
  trackEvent(userId, 'async_job_queued', { job_type: jobType, job_id: jobId });
}

export function identifyUser(
  userId: string,
  properties: Record<string, unknown>
): void {
  const client = getClient();
  if (!client) return;

  client.identify({ distinctId: userId, properties });
}

// ── Shutdown propre ────────────────────────────────────────────────────────────

export async function shutdownAnalytics(): Promise<void> {
  await _client?.shutdown();
}
