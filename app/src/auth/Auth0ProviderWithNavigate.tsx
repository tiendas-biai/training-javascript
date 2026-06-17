import type { ReactNode } from 'react';
import { Auth0Provider, type AppState } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { authConfig, isAuthConfigured } from './authEnv';

// Wraps the app in <Auth0Provider> using config from VITE_* env. Must live INSIDE
// <BrowserRouter> because it uses useNavigate to restore the pre-login route after
// the redirect callback. When Auth0 isn't configured, renders children untouched
// so the app keeps working anonymously (today's behavior).
export function Auth0ProviderWithNavigate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  if (!isAuthConfigured) return <>{children}</>;

  const onRedirectCallback = (appState?: AppState) => {
    navigate(appState?.returnTo ?? window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={authConfig.domain!}
      clientId={authConfig.clientId!}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: authConfig.audience,
      }}
      // Survive reloads/tab closes without relying on third-party-cookie silent auth.
      cacheLocation="localstorage"
      useRefreshTokens
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
}
