import { useAuth0 } from '@auth0/auth0-react';
import { isAuthConfigured } from './authEnv';

// Login / logout control for screen headers. Renders nothing until Auth0 is
// configured, so existing screens (and their tests) are unaffected until the
// tenant env vars are set. Login is never required — this is purely opt-in.
export function AuthButtons() {
  const { isAuthenticated, isLoading, user, loginWithRedirect, logout } = useAuth0();

  if (!isAuthConfigured || isLoading) return null;

  if (!isAuthenticated) {
    return (
      <button
        className="auth-btn auth-login"
        onClick={() => loginWithRedirect({ appState: { returnTo: window.location.pathname } })}
      >
        Log in
      </button>
    );
  }

  return (
    <div className="auth-user">
      {user?.picture
        ? <img className="auth-avatar" src={user.picture} alt={user.name ?? 'User'} />
        : <span className="auth-avatar auth-avatar-fallback">{(user?.name ?? '?')[0]}</span>}
      <button
        className="auth-btn auth-logout"
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      >
        Log out
      </button>
    </div>
  );
}
