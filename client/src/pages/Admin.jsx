/**
 * Admin.jsx
 * ---------------------------------------------------------------------------
 * Purpose: Admin-only page that lists all users and allows block, unblock,
 * and delete. Used for route /admin (protected, admin only).
 */

import { useState, useEffect } from "react";                                    
import { Link } from "react-router-dom";                                        // Link for nav
import { useAuth } from "../context/AuthContext";                               // Hook for logout
import * as api from "../api";                                                  // API for getUsers, deleteUser, blockUser, unblockUser

/**
 * Admin()
 * Parameters: none
 * Returns: JSX — header with nav and table of users with block/unblock/delete actions
 * Responsible for: Loading and displaying all users, handling block/unblock/delete and errors
 * Used for: /admin route when user is authenticated and has admin role
 */
export default function Admin() {
  const [users, setUsers] = useState([]);                                       // List of users from API
  const [error, setError] = useState("");                                       // Error message to show
  const [loading, setLoading] = useState(true);                                 // True while fetching users
  const { logout } = useAuth();                                                 // Logout for header button

  /**
   * loadUsers()
   * Parameters: none
   * Returns: Promise<void>
   * Responsible for: Fetching all users from admin API and updating state; sets loading and error
   * Used for: Initial load and after any user action
   */
  async function loadUsers() {
    setLoading(true);                                                           // Show loading state
    setError("");                                                               // Clear previous error
    try {
      const data = await api.getUsers();                                        // Fetch all users (admin endpoint)
      setUsers(data || []);                                                     // Update state; fallback to empty array
    } catch (err) {
      setError(err.message || "Failed to load users");                          // Show error
    } finally {
      setLoading(false);                                                        // Hide loading state
    }
  }

  useEffect(() => {
    loadUsers();                                                                // Load users when component mounts
  }, []);                                                                       // Empty deps: run once on mount

  /**
   * handleDelete(id)
   * Parameters: id — number or string, user ID to delete
   * Returns: Promise<void>
   * Responsible for: Deleting user via API and reloading list; sets error on failure
   * Used for: Delete button in table row
   */
  async function handleDelete(id) {
    setError("");  // Clear previous error
    try {
      await api.deleteUser(id);                                                 // Call API to delete user
      await loadUsers();                                                        // Refresh user list
    } catch (err) {
      setError(err.message || "Failed to delete user");                         // Show error
    }
  }

  /**
   * handleBlock(id)
   * Parameters: id — number or string, user ID to block
   * Returns: Promise<void>
   * Responsible for: Blocking user via API and reloading list; sets error on failure
   * Used for: Block button in table row
   */
  async function handleBlock(id) {
    setError("");                                                               // Clear previous error
    try {
      await api.blockUser(id);                                                  // Call API to block user
      await loadUsers();                                                        // Refresh user list
    } catch (err) {
      setError(err.message || "Failed to block user");                          // Show error
    }
  }

  /**
   * handleUnblock(id)
   * Parameters: id — number or string, user ID to unblock
   * Returns: Promise<void>
   * Responsible for: Unblocking user via API and reloading list; sets error on failure
   * Used for: Unblock button in table row
   */
  async function handleUnblock(id) {
    setError("");                                                               // Clear previous error
    try {
      await api.unblockUser(id);                                                // Call API to unblock user
      await loadUsers();                                                        // Refresh user list
    } catch (err) {
      setError(err.message || "Failed to unblock user");                        // Show error
    }
  }

  return (
    <div className="page"> 
      <header className="page-header">  
        <h1>Admin — Users (database)</h1>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/admin">Admin</Link>
          <button type="button" className="btn-link" onClick={logout}>
            Log out
          </button>
        </nav>
      </header>

      {error && <div className="error-msg">{error}</div>}  

      <section className="card table-card">  
        <h2>All users</h2>
        {loading ? (
          <p>Loading users…</p>
        ) : (
          <div className="table-wrap">  
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Blocked</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td><span className="badge">{u.role}</span></td>
                    <td>{u.is_blocked ? "Yes" : "No"}</td>
                    <td className="actions">
                      {u.is_blocked ? (
                        <button
                          type="button"
                          className="btn-sm btn-success"
                          onClick={() => handleUnblock(u.id)}
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-sm btn-warning"
                          onClick={() => handleBlock(u.id)}
                        >
                          Block
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-sm btn-danger"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
