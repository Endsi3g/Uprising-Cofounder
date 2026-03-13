/// <reference types="vite/client" />
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { initPostHog } from './lib/posthog.ts';
import App from './App.tsx';
import './index.css';
import { PostHogProvider } from '@posthog/react';

// ── Sentry — Error Tracking ────────────────────────────────────────────────────
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ["localhost", /^https:\/\/uprising-backend\.onrender\.com/],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// ── PostHog — Product Analytics ────────────────────────────────────────────────
initPostHog();

const options = { api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com', defaults: '2026-01-30' } as const;

// ── App ────────────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY || 'phc_9MJDzC5UW83HhHWdNXzmt1YeGPIh3lAzG58OrJzczHT'} options={options}>
      <App />
    </PostHogProvider>
  </StrictMode>,
);
