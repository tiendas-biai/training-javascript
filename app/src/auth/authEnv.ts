// Auth0 / API configuration, read from Vite env (VITE_*) at build time.
// Everything here is PUBLIC — it is inlined into the bundle. Only ever put
// public Auth0 SPA config + the API URL here, never secrets.
//
// import.meta.env is Vite-only. Under Jest (ts-jest, CommonJS) this module is
// replaced by authEnv.mock via moduleNameMapper, so the import.meta syntax never
// reaches the CommonJS transpiler.

const env = import.meta.env;

export const authConfig = {
  domain: env.VITE_AUTH0_DOMAIN as string | undefined,
  clientId: env.VITE_AUTH0_CLIENT_ID as string | undefined,
  audience: env.VITE_AUTH0_AUDIENCE as string | undefined,
  apiUrl: env.VITE_API_URL as string | undefined,
};

// Opt-in: load question banks from the cards API instead of the bundled JSON.
// Off by default — the bundled JSON stays the source of truth and the app needs
// no network for core content.
export const cardsFromApi =
  env.VITE_CARDS_FROM_API === 'true' && Boolean(env.VITE_API_URL);

// Auth UI is only shown when the tenant is wired up. Until the env vars are set
// (locally or in Vercel), the app behaves exactly as today — anonymous, local.
export const isAuthConfigured = Boolean(authConfig.domain && authConfig.clientId);
