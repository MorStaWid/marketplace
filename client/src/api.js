/**
 * Purpose: Central API module for all backend HTTP requests. Handles auth,
 * user items, and admin operations. Used by AuthContext and page components.
 */

const API_BASE = "http://localhost:6700";  // Base URL for the backend API server

function getToken() {
  return localStorage.getItem("token");                                             // Retrieve the JWT token from browser storage
}

/** Callback when server returns 401 (invalid/expired token). AuthContext sets this to clear token so user is redirected to login. */
let onUnauthorized = null;
export function setOnUnauthorized(fn) {
  onUnauthorized = fn;
}

/** On 401: clear stored token, notify app, throw so caller can handle. */
function handleUnauthorized() {
  localStorage.removeItem("token");
  if (typeof onUnauthorized === "function") onUnauthorized();
  throw new Error("Session expired. Please log in again.");
}

export async function register({ username, email, password, role = "customer" }) {
  const res = await fetch(`${API_BASE}/auth/register`, {                            // POST request to register endpoint
    method: "POST",                                                                 // HTTP method for creating a new user
    headers: { "Content-Type": "application/json" },                                // Tell server we send JSON body
    body: JSON.stringify({ username, email, password, role }),                      // Serialize payload to JSON string
  });
  const data = await res.json();                                                    // Parse response body as JSON
  if (!res.ok) throw new Error(data.message || "Registration failed");              // Throw if status is not 2xx
  return data;                                                                      // Return the parsed response (e.g. user or success message)
}

export async function login({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {                               // POST request to login endpoint
    method: "POST",  // HTTP method for login
    headers: { "Content-Type": "application/json" },                                // JSON content type
    body: JSON.stringify({ email, password }),                                      // Send credentials as JSON
  });
  const data = await res.json();                                                    // Parse JSON response
  if (!res.ok) throw new Error(data.message || "Login failed");                     // Throw on non-OK status
  return data;                                                                      // Return response (usually includes token)
}

export async function getUserItems() {
  const token = getToken();                                                         // Get JWT for Authorization header
  const res = await fetch(`${API_BASE}/user/items`, {                               // GET request to user items endpoint
    headers: { Authorization: `Bearer ${token}` },                                  // Send JWT in Authorization header
  });
  const data = await res.json();                                                    // Parse response JSON
  if (res.status === 401) handleUnauthorized();                                      // Invalid/expired token: clear auth and redirect to login
  if (!res.ok) throw new Error(data.message || "Failed to load items");             // Throw on error status
  return data.data;                                                                 // Return the items array from response
}

export async function addItem(name) {
  const token = getToken();                                                         // Get auth token for the request
  const res = await fetch(`${API_BASE}/user/add_item`, {                            // POST to add_item endpoint
    method: "POST",                                                                 // HTTP method for creating resource
    headers: {
      "Content-Type": "application/json",                                           // JSON body
      Authorization: `Bearer ${token}`,                                             // Auth header
    },
    body: JSON.stringify({ name }),                                                 // Send item name in request body
  });
  const data = await res.json();                                                    // Parse response
  if (res.status === 401) handleUnauthorized();                                      // Invalid/expired token: clear auth and redirect to login
  if (!res.ok) throw new Error(data.message || "Failed to add item");               // Throw on failure
  return data;                                                                      // Return response
}

export async function deleteItem(id) {
  const token = getToken();                                                        // Get JWT for auth
  const res = await fetch(`${API_BASE}/user/delete_item/${id}`, {                  // DELETE request with item id in URL
    method: "DELETE",                                                              // HTTP method for deletion
    headers: { Authorization: `Bearer ${token}` },                                 // Auth header
  });
  const data = await res.json();                                                  // Parse response
  if (res.status === 401) handleUnauthorized();                                    // Invalid/expired token: clear auth and redirect to login
  if (!res.ok) throw new Error(data.message || "Failed to delete item");          // Throw on error
  return data;                                                                    // Return response
}

export async function getUsers() {
  const token = getToken();                                                       // Get admin/user token
  const res = await fetch(`${API_BASE}/admin/get_user`, {                         // GET all users (admin)
    headers: { Authorization: `Bearer ${token}` },                                // Auth header
  });
  const data = await res.json();                                                  // Parse response
  if (res.status === 401) handleUnauthorized();                                    // Invalid/expired token: clear auth and redirect to login
  if (!res.ok) throw new Error(data.message || "Failed to load users");           // Throw on error
  return data.data;                                                               // Return users array from response
}


export async function deleteUser(id) {
  const token = getToken();                                                       // Get auth token
  const res = await fetch(`${API_BASE}/admin/delete_user/${id}`, {                // DELETE user by id in URL
    method: "DELETE",                                                             // HTTP method
    headers: { Authorization: `Bearer ${token}` },                                // Auth header
  });
  const data = await res.json();                                                  // Parse response
  if (res.status === 401) handleUnauthorized();                                    // Invalid/expired token: clear auth and redirect to login
  if (!res.ok) throw new Error(data.message || "Failed to delete user");          // Throw on error
  return data;                                                                    // Return response
}

export async function blockUser(id) {
  const token = getToken();                                                       // Get auth token
  const res = await fetch(`${API_BASE}/admin/block_user/${id}`, {                 // PATCH to block user
    method: "PATCH",                                                              // HTTP method for partial update
    headers: { Authorization: `Bearer ${token}` },                                // Auth header
  });
  const data = await res.json();                                                  // Parse response
  if (res.status === 401) handleUnauthorized();                                    // Invalid/expired token: clear auth and redirect to login
  if (!res.ok) throw new Error(data.message || "Failed to block user");           // Throw on error
  return data;                                                                    // Return response
}

export async function unblockUser(id) {
  const token = getToken();                                                       // Get auth token
  const res = await fetch(`${API_BASE}/admin/unblock_user/${id}`, {               // PATCH to unblock user
    method: "PATCH",                                                              // HTTP method for partial update
    headers: { Authorization: `Bearer ${token}` },                                // Auth header
  });
  const data = await res.json();                                                  // Parse response
  if (res.status === 401) handleUnauthorized();                                    // Invalid/expired token: clear auth and redirect to login
  if (!res.ok) throw new Error(data.message || "Failed to unblock user");         // Throw on error
  return data;                                                                    // Return response
}
