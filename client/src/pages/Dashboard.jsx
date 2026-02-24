/**
 * Dashboard.jsx
 * ---------------------------------------------------------------------------
 * Purpose: User dashboard page showing the current user's items. Allows adding
 * and deleting items via API. Used for route /dashboard (protected).
 */

import { useState, useEffect } from "react";                                    // useState for list and form state, useEffect to load items on mount
import { Link } from "react-router-dom";                                        // Link for nav to dashboard and admin
import { useAuth } from "../context/AuthContext";                               // Hook for logout and isAdmin
import * as api from "../api";                                                  // API for getUserItems, addItem, deleteItem

/**
 * Dashboard()
 * Parameters: none
 * Returns: JSX — header with nav, add-item form, and list of user items
 * Responsible for: Loading and displaying user items, adding/deleting items, showing errors and loading state
 * Used for: /dashboard route when user is authenticated
 */
export default function Dashboard() {
  const [items, setItems] = useState([]);                                       // List of items from API
  const [newItemName, setNewItemName] = useState("");                           // Controlled input for new item name
  const [error, setError] = useState("");                                       // Error message to show
  const [loading, setLoading] = useState(true);                                 // True while fetching items
  const [submitting, setSubmitting] = useState(false);                          // True while add request is in progress
  const { logout, isAdmin } = useAuth();                                        // Logout function and admin flag for nav link

  /**
   * loadItems()
   * Parameters: none
   * Returns: Promise<void>
   * Responsible for: Fetching user items from API and updating state; sets loading and error
   * Used for: Initial load and after add/delete
   */
  async function loadItems() {
    setLoading(true);                                                           // Show loading state
    setError("");                                                               // Clear previous error
    try {
      const data = await api.getUserItems();                                    // Fetch items for current user
      setItems(data || []);                                                     // Update state; fallback to empty array if no data
    } catch (err) {
      setError(err.message || "Failed to load items");                          // Show error message
    } finally {
      setLoading(false);                                                        // Hide loading state
    }
  }

  useEffect(() => {
    loadItems();                                                                // Load items when component mounts
  }, []);                                                                       // Empty deps: run once on mount

  /**
   * handleAdd(e)
   * Parameters: e — form submit event
   * Returns: Promise<void>
   * Responsible for: Adding a new item via API, clearing input, reloading list; handles errors
   * Used for: Add item form submit
   */
  async function handleAdd(e) {
    e.preventDefault();                                                         // Prevent default form submit
    if (!newItemName.trim()) return;                                            // Ignore empty input
    setError("");                                                               // Clear error
    setSubmitting(true);                                                        // Disable form while submitting
    try {
      await api.addItem(newItemName.trim());                                    // Call API to add item
      setNewItemName("");                                                       // Clear input
      await loadItems();                                                        // Refresh list
    } catch (err) {
      setError(err.message || "Failed to add item");  // Show error
    } finally {
      setSubmitting(false);  // Re-enable form
    }
  }

  /**
   * handleDelete(id)
   * Parameters: id — number or string, the item ID to delete
   * Returns: Promise<void>
   * Responsible for: Deleting item via API and reloading list; sets error on failure
   * Used for: Delete button click per item
   */
  async function handleDelete(id) {
    setError("");                                                               // Clear previous error
    try {
      await api.deleteItem(id);                                                 // Call API to delete item
      await loadItems();                                                        // Refresh list
    } catch (err) {
      setError(err.message || "Failed to delete item");                         // Show error
    }
  }

  return (
    <div className="page">  
      <header className="page-header">  
        <h1>My items</h1>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          {isAdmin && <Link to="/admin">Admin</Link>}  
          <button type="button" className="btn-link" onClick={logout}>
            Log out
          </button>
        </nav>
      </header>

      <section className="card">  
        <h2>Add item</h2>
        <form onSubmit={handleAdd} className="form-inline">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Item name"
            disabled={submitting}
          />
          <button type="submit" disabled={submitting || !newItemName.trim()}>
            Add
          </button>
        </form>
      </section>

      {error && <div className="error-msg">{error}</div>}  

      <section className="card">  
        <h2>Your list (from database)</h2>
        {loading ? (
          <p>Loading items…</p>
        ) : items.length === 0 ? (
          <p className="muted">No items yet. Add one above.</p>
        ) : (
          <ul className="item-list">
            {items.map((item) => (
              <li key={item.id}>
                <span>{item.name}</span>
                <button
                  type="button"
                  className="btn-danger btn-sm"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
