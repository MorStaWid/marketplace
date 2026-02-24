import { useState } from "react";  
import { Link, useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext";  

/**
 * Register()
 * Parameters: none
 * Returns: JSX — registration form and link to login
 * Responsible for: Rendering register form, calling auth register, redirecting to login with message
 * Used for: /register route in App.jsx
 */
export default function Register() {
  const [username, setUsername] = useState("");                             // Controlled input for username
  const [email, setEmail] = useState("");                                   // Controlled input for email
  const [password, setPassword] = useState("");                             // Controlled input for password
  const [role, setRole] = useState("customer");                             // Selected role: customer or admin
  const [error, setError] = useState("");                                   // Error message to display
  const [loading, setLoading] = useState(false);                            // True while register request is in progress
  const { register } = useAuth();                                           // Get register function from context
  const navigate = useNavigate();                                           // For redirect to login after success

  /**
   * handleSubmit(e)
   * Parameters: e — form submit event
   * Returns: void (async)
   * Responsible for: Submitting registration, redirecting to login with success message, handling errors
   * Used for: Form onSubmit handler
   */
  async function handleSubmit(e) {
    e.preventDefault();                                                     // Prevent default form submit
    setError("");                                                           // Clear previous error
    setLoading(true);                                                       // Show loading state
    try {
      await register(username, email, password, role);                      // Call context register (API call)
      navigate("/login", { state: { message: "Registration successful. Please sign in." } });  
    } catch (err) {
      setError(err.message || "Registration failed");  
    } finally {
      setLoading(false);  
    }
  }

  return (
    <div className="auth-page">  
      <div className="auth-card">  
        <h1>Create account</h1>
        <form onSubmit={handleSubmit}> 
          {error && <div className="error-msg">{error}</div>}  
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
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
              autoComplete="new-password"
            />
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
