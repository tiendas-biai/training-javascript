import { useAuth0 } from '@auth0/auth0-react';

// True when the logged-in user carries the `admin` role. Read from the ID token
// claims exposed on useAuth0().user — the app's Auth0 Action surfaces roles as a
// non-namespaced `user_roles` claim (with `roles` as a fallback). This gates the
// admin UI; the API independently enforces the same on every write.
export function useIsAdmin(): boolean {
  const { user } = useAuth0();
  if (!user) return false;
  const claims = user as Record<string, unknown>;
  const roles = [claims.user_roles, claims.roles].flatMap(v => (Array.isArray(v) ? v : []));
  return roles.includes('admin');
}
