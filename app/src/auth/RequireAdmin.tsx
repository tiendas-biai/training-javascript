import type { ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from './useIsAdmin';

// Route guard for admin-only screens: waits for Auth0 to settle, prompts login
// when anonymous, and shows a "not authorized" notice for non-admins. The cards
// API enforces the same rule server-side, so this is UX, not the security line.
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="screen">
        <div className="nothing-due">
          <div className="nothing-due-icon">🔒</div>
          <h2>Admin</h2>
          <p>Log in to manage cards.</p>
          <button
            className="btn-primary"
            style={{ marginTop: 24 }}
            onClick={() => loginWithRedirect({ appState: { returnTo: window.location.pathname } })}
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="screen">
        <div className="nothing-due">
          <div className="nothing-due-icon">🚫</div>
          <h2>Not authorized</h2>
          <p>You need the admin role to manage cards.</p>
          <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
