import { useState } from "react";  
import { Link, useNavigate, useLocation } from "react-router-dom";        // Link for register link, navigate and location for redirect after login
import { useAuth } from "../context/AuthContext";                         // Hook to get login function and auth state

export default function Login() {
  const [email, setEmail] = useState("");                                 // Controlled input value for email
  const [password, setPassword] = useState("");                           // Controlled input value for password
  const [error, setError] = useState("");                                 // Error message to show (e.g. invalid credentials)
  const [loading, setLoading] = useState(false);                          // True while login request is in progress
  const { login } = useAuth();                                            // Get login function from context
  const navigate = useNavigate();                                         // Programmatic navigation after success
  const location = useLocation();                                         // To read redirect path passed from ProtectedRoute
  const from = location.state?.from?.pathname || "/dashboard";            // Where to go after login; default dashboard
  const successMessage = location.state?.message;                         // Optional message (e.g. after registration)

  /**
   * handleSubmit(e)
   * Parameters: e — form submit event
   * Returns: void (async)
   * Responsible for: Preventing default submit, calling login, navigating on success, setting error/loading
   * Used for: Form onSubmit handler
   */
  async function handleSubmit(e) {
    e.preventDefault();                                                   // Prevent full page form submit
    setError("");                                                         // Clear previous error
    setLoading(true);                                                     // Show loading state
    try {
      await login(email, password);                                       // Call context login (API call and token storage)
      navigate(from, { replace: true });                                  // Redirect to intended page or dashboard
    } catch (err) {
      setError(err.message || "Login failed");                            // Show error message from API or generic
    } finally {
      setLoading(false);                                                  // Reset loading state
    }
  }

  return (
    <div className="auth-page">  
      <div className="auth-card">  
        <h1>Sign in</h1>
        {successMessage && <div className="success-msg">{successMessage}</div>}  {/* Show message from state (e.g. after register) */}
        <form onSubmit={handleSubmit}>                                           {/* Form submits via handleSubmit */}
          {error && <div className="error-msg">{error}</div>}                    {/* Show error if any */}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
