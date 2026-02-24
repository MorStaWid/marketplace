import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";            //React Router allows navigation between different views without requiring a full page reload from the server | npm install react-router-dom
import { AuthProvider, useAuth } from "./context/AuthContext";                        // Auth context provider and hook for login state and role
import { ProtectedRoute } from "./components/ProtectedRoute";                         // Wrapper that redirects unauthenticated or non-admin users
import Login from "./pages/Login";                                                  
import Register from "./pages/Register";                                            
import Dashboard from "./pages/Dashboard";                                           
import Admin from "./pages/Admin";                                    
import "./App.css";  

/**
 * HomeRedirect()
 * Parameters: none
 * Returns: JSX — either Navigate to /login, or Navigate to /admin or /dashboard
 * Responsible for: Deciding where to send the user when they visit "/" based on auth and role
 * Used for: Root path "/" to avoid showing a blank home and enforce correct landing page
 */
function HomeRedirect() {
  const { isAuthenticated, isAdmin } = useAuth();  // Get current auth state and admin flag from context
  if (!isAuthenticated) return <Navigate to="/login" replace />;  // Not logged in: redirect to login
  return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;  // Logged in: send admin to /admin, others to /dashboard
}

function App() {
  return (
    <BrowserRouter>                                                 {/* Provides routing context for the app */}
      <AuthProvider>                                                {/* Wraps app so all children can access auth state and actions */}
        <Routes>                                                    {/* Container for route definitions */}
          <Route path="/" element={<HomeRedirect />} />             {/* Root path uses redirect component */}
          <Route path="/login" element={<Login />} />               {/* Login page route */}
          <Route path="/register" element={<Register />} />         {/* Register page route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>                                      {/* Require login; no admin required */}
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>                            {/* Require login and admin role */}
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />  {/* Catch-all: redirect unknown paths to home */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;  
