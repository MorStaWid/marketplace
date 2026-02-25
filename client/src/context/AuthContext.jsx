/**
 * AuthContext.jsx
 * ---------------------------------------------------------------------------
 * Purpose: Provides authentication state (token, user, isAdmin) and actions
 * (login, register, logout) to the whole app. Used so any component can
 * read auth and perform sign-in/sign-out without prop drilling.
 */

import { createContext, useContext, useState, useEffect } from "react";  
import * as api from "../api";                           

/**
 * parseToken(token)
 * Parameters: token — string | null, the JWT to decode
 * Returns: object | null — decoded payload (e.g. user id, role) or null if invalid/missing
 * Responsible for: Decoding the JWT payload without verifying signature (client-side only)
 * Used for: Deriving user info and role from stored token in AuthProvider
 */
function parseToken(token) {
  if (!token) return null; 
  try {
    const payload = token.split(".")[1];                                    // JWT format is header.payload.signature; take middle part
    return JSON.parse(atob(payload));                                       // Base64-decode and parse JSON to get payload object
  } catch {
    return null;                                                            // If decode or parse fails, return null
  }
}

const AuthContext = createContext(null);                                    // Create context with default value null; will be set by AuthProvider

/**
 * AuthProvider({ children })
 * Parameters: children — React nodes to wrap (the app or a subtree)
 * Returns: JSX — AuthContext.Provider wrapping children with auth value
 * Responsible for: Holding token and user state, syncing token to localStorage, exposing login/register/logout and derived state
 * Used for: Wrapping the app in App.jsx so all routes can use useAuth()
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));    // Token state; init from localStorage if present
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("token");                                  // Read token from storage for initial user
    return t ? parseToken(t) : null;                                          // Decode to get user payload or null
  });
  const [tokenExpiredModal, setTokenExpiredModal] = useState(false);           // When true: freeze page and show "token expired" card; user clicks button to go to login

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);                                   // Persist token to storage when it changes
      setUser(parseToken(token));                                             // Update user from new token payload
    } else {
      localStorage.removeItem("token");                                       // Clear storage when token is cleared (logout)
      setUser(null);                                                          // Clear user state
    }
  }, [token]);                                                                // Run when token state changes

  // When the server returns 401 (invalid/expired token), show modal and freeze page; do not redirect until user clicks "Return to login"
  useEffect(() => {
    api.setOnUnauthorized(() => setTokenExpiredModal(true));
    return () => api.setOnUnauthorized(null);
  }, []);

  // Token expires in 5 seconds (for testing). Uncomment to test; keep commented in production.
  useEffect(() => {
    if (!token) return;
    const expiryMs = 5000;
    const timer = setTimeout(() => setTokenExpiredModal(true), expiryMs);
    return () => clearTimeout(timer);
  }, [token]);

  const login = async (email, password) => {                                  // Login handler: call API and store token
    const data = await api.login({ email, password });                        // Send credentials to backend
    setToken(data.token);                                                     // Store returned JWT in state (effect will sync to localStorage and setUser)
  };

  const register = async (username, email, password, role = "customer") => {  // Register handler: call API (no token; user must log in)
    await api.register({ username, email, password, role });                  // Create user on backend
  };

  const logout = () => setToken(null);                                        // Clear token to log out (effect will clear storage and user)

  const value = {
    token,
    user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    isAuthenticated: !!token,
    tokenExpiredModal,
    clearTokenExpiredModal: () => setTokenExpiredModal(false),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;  // Provide value to all descendants
}

/**
 * useAuth()
 * Parameters: none
 * Returns: object — { token, user, isAdmin, login, register, logout, isAuthenticated }
 * Responsible for: Giving components access to auth context; throws if used outside AuthProvider
 * Used for: Any component that needs to read auth state or call login/register/logout
 */
export function useAuth() {
  const ctx = useContext(AuthContext);                                          // Read the context value
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");        // Guard: context is null if used outside provider
  return ctx;                                                                   // Return the auth value object
}
