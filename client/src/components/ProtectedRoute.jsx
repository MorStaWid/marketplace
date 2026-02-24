/**
 * ProtectedRoute.jsx
 * ---------------------------------------------------------------------------
 * Purpose: Wraps routes that require authentication (and optionally admin).
 * Redirects to /login if not logged in, or to /dashboard if admin-only and
 * user is not admin. Used in App.jsx for /dashboard and /admin routes.
 */

import { Navigate, useLocation } from "react-router-dom";                 // Navigate for redirects, useLocation to remember where user came from
import { useAuth } from "../context/AuthContext";                         // Hook to read isAuthenticated and isAdmin

export function ProtectedRoute({ children, adminOnly }) {
  const { isAuthenticated, isAdmin } = useAuth();                         // Get auth state and admin flag from context
  const location = useLocation();                                         // Current route (used to redirect back after login)

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;   // Not logged in: redirect to login and save intended destination
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;                          // Admin-only route but user is not admin: send to dashboard
  }
  return children;                                                        // Access allowed: render the protected content
}
