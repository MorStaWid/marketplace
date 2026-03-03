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

async function authorizedRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) handleUnauthorized();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
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
  const data = await authorizedRequest("/user/items");                              // GET user items with auth helper
  return data.data;                                                                 // Return the items array from response
}

export async function addItem(name) {
  return authorizedRequest("/user/add_item", {                                      // POST to add_item endpoint with auth helper
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function deleteItem(id) {
  return authorizedRequest(`/user/delete_item/${id}`, {                             // DELETE item with auth helper
    method: "DELETE",
  });
}

export async function getUsers() {
  const data = await authorizedRequest("/admin/get_user");                          // GET all users (admin) with auth helper
  return data.data;                                                                 // Return users array from response
}


export async function deleteUser(id) {
  return authorizedRequest(`/admin/delete_user/${id}`, {                            // DELETE user by id with auth helper
    method: "DELETE",
  });
}

export async function blockUser(id) {
  return authorizedRequest(`/admin/block_user/${id}`, {                             // PATCH to block user with auth helper
    method: "PATCH",
  });
}

export async function unblockUser(id) {
  return authorizedRequest(`/admin/unblock_user/${id}`, {                           // PATCH to unblock user with auth helper
    method: "PATCH",
  });
}

// Listings
export async function getListings() {
  const res = await fetch(`${API_BASE}/listings`);                                  // Public listings browse
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load listings");
  return data.data;
}

export async function createListing({ title, description, priceCents, quantityAvailable }) {
  const data = await authorizedRequest("/listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, priceCents, quantityAvailable }),
  });
  return data.data;
}

export async function getMyListings() {
  const data = await authorizedRequest("/listings/mine");
  return data.data;
}

// Cart
export async function getCart() {
  const data = await authorizedRequest("/cart");
  return data.data;
}

export async function addToCart({ listingId, quantity }) {
  const data = await authorizedRequest("/cart/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId, quantity }),
  });
  return data.data;
}

export async function updateCartItem(id, quantity) {
  const data = await authorizedRequest(`/cart/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  return data.data;
}

export async function removeCartItem(id) {
  const data = await authorizedRequest(`/cart/items/${id}`, {
    method: "DELETE",
  });
  return data.data;
}

// Orders & payments
export async function checkout() {
  const data = await authorizedRequest("/orders/checkout", {
    method: "POST",
  });
  return data.data;
}

export async function getBuyerOrders() {
  const data = await authorizedRequest("/orders/buyer");
  return data.data;
}

export async function getSellerOrders() {
  const data = await authorizedRequest("/orders/seller");
  return data.data;
}
