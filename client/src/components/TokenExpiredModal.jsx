/**
 * TokenExpiredModal.jsx
 * ---------------------------------------------------------------------------
 * Purpose: When the token expires, freezes the current page with a blurred
 * overlay and shows a centered card. User must click "Return to login" to go
 * to the login page (no automatic redirect).
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function TokenExpiredModal() {
  const { tokenExpiredModal, clearTokenExpiredModal, logout } = useAuth();
  const navigate = useNavigate();

  const handleReturnToLogin = () => {
    clearTokenExpiredModal();
    logout();
    navigate("/login", { replace: true });
  };

  if (!tokenExpiredModal) return null;

  return (
    <div className="token-expired-overlay" aria-modal="true" role="dialog" aria-labelledby="token-expired-title">
      <div className="token-expired-backdrop" />
      <div className="token-expired-card">
        <h2 id="token-expired-title" className="token-expired-title">Session expired</h2>
        <p className="token-expired-message">
          Your token has expired. Please sign in again to continue.
        </p>
        <button
          type="button"
          className="token-expired-button"
          onClick={handleReturnToLogin}
        >
          Return to login
        </button>
      </div>
    </div>
  );
}
