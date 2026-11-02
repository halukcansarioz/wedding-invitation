import * as Sentry from "@sentry/react";

const dsn = String(import.meta.env.VITE_SENTRY_DSN || "").trim();

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: String(import.meta.env.VITE_APP_VERSION || "wedding-invitation@dev"),
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
  });
}
