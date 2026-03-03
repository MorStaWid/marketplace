/**
 * Dashboard.jsx
 * ---------------------------------------------------------------------------
 * Purpose: Unified marketplace dashboard where any authenticated user can:
 * - Browse all active listings
 * - Create and manage their own listings
 * - Manage their shopping bag (cart)
 * - View orders and payments as both buyer and seller
 * Used for route /dashboard (protected).
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../api";

const TABS = {
  BROWSE: "browse",
  MY_LISTINGS: "myListings",
  CART: "cart",
  ORDERS: "orders",
};

export default function Dashboard() {
  const { logout, isAdmin, user } = useAuth();

  const [activeTab, setActiveTab] = useState(TABS.BROWSE);

  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);

  const [addToCartQuantities, setAddToCartQuantities] = useState({});

  const [newListingTitle, setNewListingTitle] = useState("");
  const [newListingDescription, setNewListingDescription] = useState("");
  const [newListingPrice, setNewListingPrice] = useState("");
  const [newListingQuantity, setNewListingQuantity] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentUserId = user?.userId;

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [
        listingsData,
        myListingsData,
        cartData,
        buyerOrdersData,
        sellerOrdersData,
      ] = await Promise.all([
        api.getListings(),
        api.getMyListings(),
        api.getCart(),
        api.getBuyerOrders(),
        api.getSellerOrders(),
      ]);

      setListings(listingsData || []);
      setMyListings(myListingsData || []);
      setCart(cartData?.cart || null);
      setCartItems(cartData?.items || []);
      setBuyerOrders(buyerOrdersData || []);
      setSellerOrders(sellerOrdersData || []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateListing(e) {
    e.preventDefault();
    if (!newListingTitle.trim()) return;

    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const priceNumber = Number(newListingPrice);
      const quantityNumber = Number(newListingQuantity || 0);
      const priceCents = Number.isFinite(priceNumber) && priceNumber >= 0
        ? Math.round(priceNumber * 100)
        : 0;

      await api.createListing({
        title: newListingTitle.trim(),
        description: newListingDescription.trim(),
        priceCents,
        quantityAvailable: Number.isInteger(quantityNumber) && quantityNumber >= 0
          ? quantityNumber
          : 0,
      });

      setNewListingTitle("");
      setNewListingDescription("");
      setNewListingPrice("");
      setNewListingQuantity("");

      setMessage("Listing created successfully.");
      const [listingsData, myListingsData] = await Promise.all([
        api.getListings(),
        api.getMyListings(),
      ]);
      setListings(listingsData || []);
      setMyListings(myListingsData || []);
    } catch (err) {
      setError(err.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  }

  function handleQuantityChange(listingId, value) {
    const parsed = Number(value);
    setAddToCartQuantities((prev) => ({
      ...prev,
      [listingId]: Number.isInteger(parsed) && parsed > 0 ? parsed : 1,
    }));
  }

  async function handleAddToCart(listingId) {
    setError("");
    setMessage("");
    try {
      const quantity =
        addToCartQuantities[listingId] && addToCartQuantities[listingId] > 0
          ? addToCartQuantities[listingId]
          : 1;

      const data = await api.addToCart({ listingId, quantity });
      setCart(data.cart || null);
      setCartItems(data.items || []);
      setMessage("Item added to your bag.");
      setActiveTab(TABS.CART);
    } catch (err) {
      setError(err.message || "Failed to add item to bag");
    }
  }

  async function handleUpdateCartItem(cartItemId, quantity) {
    setError("");
    setMessage("");
    try {
      const data = await api.updateCartItem(cartItemId, quantity);
      setCart(data.cart || null);
      setCartItems(data.items || []);
      setMessage("Bag updated.");
    } catch (err) {
      setError(err.message || "Failed to update bag");
    }
  }

  async function handleRemoveCartItem(cartItemId) {
    setError("");
    setMessage("");
    try {
      const data = await api.removeCartItem(cartItemId);
      setCart(data.cart || null);
      setCartItems(data.items || []);
      setMessage("Item removed from your bag.");
    } catch (err) {
      setError(err.message || "Failed to remove item from bag");
    }
  }

  async function handleCheckout() {
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const result = await api.checkout();
      setCart(result.cart || null);
      setCartItems(result.items || []);

      const [buyerOrdersData, sellerOrdersData] = await Promise.all([
        api.getBuyerOrders(),
        api.getSellerOrders(),
      ]);
      setBuyerOrders(buyerOrdersData || []);
      setSellerOrders(sellerOrdersData || []);

      setMessage("Checkout completed. Thank you for your purchase!");
      setActiveTab(TABS.ORDERS);
    } catch (err) {
      setError(err.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  const hasSellerSales = sellerOrders.length > 0;
  const hasBuyerOrders = buyerOrders.length > 0;

  const cartSubtotalCents = cartItems.reduce(
    (sum, item) => sum + item.price_cents * item.quantity,
    0
  );

  function formatCents(cents) {
    return (cents / 100).toFixed(2);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Marketplace dashboard</h1>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          {isAdmin && <Link to="/admin">Admin</Link>}
          <button type="button" className="btn-link" onClick={logout}>
            Log out
          </button>
        </nav>
      </header>

      <section className="card">
        <div className="dashboard-tabs">
          <button
            type="button"
            className={activeTab === TABS.BROWSE ? "tab active" : "tab"}
            onClick={() => setActiveTab(TABS.BROWSE)}
          >
            Browse listings
          </button>
          <button
            type="button"
            className={activeTab === TABS.MY_LISTINGS ? "tab active" : "tab"}
            onClick={() => setActiveTab(TABS.MY_LISTINGS)}
          >
            My listings
          </button>
          <button
            type="button"
            className={activeTab === TABS.CART ? "tab active" : "tab"}
            onClick={() => setActiveTab(TABS.CART)}
          >
            My bag
            {cartItems.length > 0 && (
              <span className="badge badge-pill">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
          <button
            type="button"
            className={activeTab === TABS.ORDERS ? "tab active" : "tab"}
            onClick={() => setActiveTab(TABS.ORDERS)}
          >
            Orders & payments
            {(hasBuyerOrders || hasSellerSales) && (
              <span className="badge badge-pill">●</span>
            )}
          </button>
        </div>
      </section>

      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <section className="card">
          <p>Loading marketplace…</p>
        </section>
      ) : (
        <>
          {activeTab === TABS.BROWSE && (
            <section className="card">
              <h2>Browse listings</h2>
              {listings.length === 0 ? (
                <p className="muted">
                  No listings yet. Be the first to post something in{" "}
                  <strong>My listings</strong>.
                </p>
              ) : (
                <div className="listing-grid">
                  {listings.map((listing) => {
                    const isMine = listing.seller_id === currentUserId;
                    const disabled = listing.status !== "active" || listing.quantity_available <= 0;
                    return (
                      <article key={listing.id} className="listing-card">
                        <header>
                          <h3>{listing.title}</h3>
                          <p className="listing-price">
                            ${formatCents(listing.price_cents)}
                          </p>
                        </header>
                        {listing.description && (
                          <p className="listing-description">
                            {listing.description}
                          </p>
                        )}
                        <p className="listing-meta">
                          <span>Seller: {listing.seller_username}</span>
                          <span>
                            In stock: {listing.quantity_available} •{" "}
                            <span className={`badge status-${listing.status}`}>
                              {listing.status}
                            </span>
                          </span>
                        </p>
                        <div className="listing-actions">
                          <input
                            type="number"
                            min="1"
                            value={addToCartQuantities[listing.id] || 1}
                            onChange={(e) =>
                              handleQuantityChange(listing.id, e.target.value)
                            }
                            disabled={disabled || isMine}
                          />
                          <button
                            type="button"
                            className="btn-success"
                            disabled={disabled || isMine}
                            onClick={() => handleAddToCart(listing.id)}
                          >
                            {isMine ? "Your listing" : "Add to bag"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === TABS.MY_LISTINGS && (
            <>
              <section className="card">
                <h2>Create a new listing</h2>
                <form onSubmit={handleCreateListing} className="form-grid">
                  <label>
                    Title
                    <input
                      type="text"
                      value={newListingTitle}
                      onChange={(e) => setNewListingTitle(e.target.value)}
                      placeholder="Vintage camera, handmade mug..."
                      disabled={submitting}
                      required
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={newListingDescription}
                      onChange={(e) => setNewListingDescription(e.target.value)}
                      placeholder="Add a short, friendly description."
                      disabled={submitting}
                      rows={3}
                    />
                  </label>
                  <div className="form-grid-row">
                    <label>
                      Price (USD)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newListingPrice}
                        onChange={(e) => setNewListingPrice(e.target.value)}
                        placeholder="19.99"
                        disabled={submitting}
                        required
                      />
                    </label>
                    <label>
                      Quantity available
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={newListingQuantity}
                        onChange={(e) => setNewListingQuantity(e.target.value)}
                        placeholder="1"
                        disabled={submitting}
                        required
                      />
                    </label>
                  </div>
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn-success"
                      disabled={submitting}
                    >
                      Post listing
                    </button>
                  </div>
                </form>
              </section>

              <section className="card">
                <h2>My listings</h2>
                {myListings.length === 0 ? (
                  <p className="muted">
                    You haven&apos;t posted anything yet. Create your first listing
                    above.
                  </p>
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Price</th>
                          <th>Available</th>
                          <th>Status</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myListings.map((listing) => (
                          <tr key={listing.id}>
                            <td>{listing.title}</td>
                            <td>${formatCents(listing.price_cents)}</td>
                            <td>{listing.quantity_available}</td>
                            <td>
                              <span className={`badge status-${listing.status}`}>
                                {listing.status}
                              </span>
                            </td>
                            <td>
                              {new Date(listing.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {activeTab === TABS.CART && (
            <section className="card">
              <h2>My bag</h2>
              {cartItems.length === 0 ? (
                <p className="muted">
                  Your bag is empty. Add something from{" "}
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => setActiveTab(TABS.BROWSE)}
                  >
                    Browse listings
                  </button>
                  .
                </p>
              ) : (
                <>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Seller</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr key={item.cart_item_id}>
                            <td>{item.title}</td>
                            <td>{item.seller_username}</td>
                            <td>${formatCents(item.price_cents)}</td>
                            <td>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateCartItem(
                                    item.cart_item_id,
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </td>
                            <td>
                              $
                              {formatCents(
                                item.price_cents * item.quantity
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn-danger btn-sm"
                                onClick={() =>
                                  handleRemoveCartItem(item.cart_item_id)
                                }
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="cart-summary">
                    <div>
                      <p>
                        Subtotal:{" "}
                        <strong>${formatCents(cartSubtotalCents)}</strong>
                      </p>
                      <p className="muted">
                        Taxes, shipping, and real payment processing are not
                        implemented in this demo.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-success"
                      disabled={submitting || cartItems.length === 0}
                      onClick={handleCheckout}
                    >
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </section>
          )}

          {activeTab === TABS.ORDERS && (
            <section className="card">
              <h2>Orders & payments</h2>
              <div className="orders-layout">
                <div className="orders-column">
                  <h3>As buyer</h3>
                  {buyerOrders.length === 0 ? (
                    <p className="muted">
                      You haven&apos;t placed any orders yet.
                    </p>
                  ) : (
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {buyerOrders.map((order) => (
                            <tr key={order.id}>
                              <td>#{order.id}</td>
                              <td>${formatCents(order.total_cents)}</td>
                              <td>
                                <span
                                  className={`badge status-${order.status}`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`badge payment-${order.payment_status || "unknown"}`}
                                >
                                  {order.payment_status || "unknown"}
                                </span>
                              </td>
                              <td>
                                {new Date(order.created_at).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="orders-column">
                  <h3>As seller</h3>
                  {sellerOrders.length === 0 ? (
                    <p className="muted">
                      No sales yet. When someone buys your listings, they&apos;ll
                      appear here.
                    </p>
                  ) : (
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Buyer</th>
                            <th>Listing</th>
                            <th>Quantity</th>
                            <th>Price (each)</th>
                            <th>Payment</th>
                            <th>Ordered at</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sellerOrders.map((item) => (
                            <tr key={item.order_item_id}>
                              <td>#{item.order_id}</td>
                              <td>{item.buyer_username}</td>
                              <td>{item.listing_id}</td>
                              <td>{item.quantity}</td>
                              <td>
                                ${formatCents(item.price_cents_at_purchase)}
                              </td>
                              <td>
                                <span
                                  className={`badge payment-${item.payment_status || "unknown"}`}
                                >
                                  {item.payment_status || "unknown"}
                                </span>
                              </td>
                              <td>
                                {new Date(
                                  item.order_created_at
                                ).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

