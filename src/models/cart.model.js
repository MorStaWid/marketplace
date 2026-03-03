const pool = require("../config/db");

exports.getOrCreateActiveCart = async (userId) => {
  const existing = await pool.query(
    `SELECT *
     FROM carts
     WHERE user_id = $1
       AND status = 'active'
     LIMIT 1`,
    [userId]
  );

  if (existing.rows.length) return existing.rows[0];

  const created = await pool.query(
    `INSERT INTO carts (user_id)
     VALUES ($1)
     RETURNING *`,
    [userId]
  );

  return created.rows[0];
};

exports.getCartWithItems = async (userId) => {
  const cartResult = await pool.query(
    `SELECT *
     FROM carts
     WHERE user_id = $1
       AND status = 'active'
     LIMIT 1`,
    [userId]
  );

  if (!cartResult.rows.length) {
    return { cart: null, items: [] };
  }

  const cart = cartResult.rows[0];

  const itemsResult = await pool.query(
    `SELECT
       ci.id AS cart_item_id,
       ci.quantity,
       ci.added_at,
       l.id AS listing_id,
       l.title,
       l.description,
       l.price_cents,
       l.quantity_available,
       l.status AS listing_status,
       u.username AS seller_username
     FROM cart_items ci
     JOIN listings l ON ci.listing_id = l.id
     JOIN users u ON l.seller_id = u.id
     WHERE ci.cart_id = $1
     ORDER BY ci.added_at DESC`,
    [cart.id]
  );

  return { cart, items: itemsResult.rows };
};

exports.clearCart = (cartId) =>
  pool.query(
    `DELETE FROM cart_items
     WHERE cart_id = $1`,
    [cartId]
  );

exports.markCartAbandoned = (cartId) =>
  pool.query(
    `UPDATE carts
     SET status = 'abandoned',
         updated_at = now()
     WHERE id = $1`,
    [cartId]
  );

