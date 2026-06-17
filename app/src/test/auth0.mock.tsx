// Default Jest stand-in for @auth0/auth0-react (mapped in via jest.config.cjs).
// Presents an anonymous, settled auth state so screens take the local path —
// keeping existing tests behaving exactly as pre-auth. A test that needs the
// authenticated branch overrides this with a local jest.mock('@auth0/auth0-react').
import type { ReactNode } from 'react';

export const useAuth0 = () => ({
  isAuthenticated: false,
  isLoading: false,
  user: undefined as { name?: string; picture?: string } | undefined,
  getAccessTokenSilently: async () => '',
  loginWithRedirect: async () => {},
  logout: async () => {},
});

export const Auth0Provider = ({ children }: { children: ReactNode }) => <>{children}</>;
