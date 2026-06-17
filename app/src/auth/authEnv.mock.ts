// Jest stand-in for authEnv.ts (which uses Vite's import.meta.env, invalid under
// the CommonJS test transpile). Mapped in via jest.config.cjs moduleNameMapper.
// Tests run as if Auth0 is not configured, so the app stays on the local path.

export const authConfig = {
  domain: undefined as string | undefined,
  clientId: undefined as string | undefined,
  audience: undefined as string | undefined,
  apiUrl: undefined as string | undefined,
};

export const isAuthConfigured = false;
