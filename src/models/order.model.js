const pool = require("../config/db");

exports.createOrder = ({ buyerId, totalCents, status = "pending" }) =>
  pool.query(
    `INSERT INTO orders (buyer_id, total_cents, status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [buyerId, totalCents, status]
  );

exports.getOrdersByBuyerId = (buyerId) =>
  pool.query(
    `SELECT
       o.*,
       p.status AS payment_status
     FROM orders o
     LEFT JOIN LATERAL (
       SELECT status
       FROM payments
       WHERE order_id = o.id
       ORDER BY created_at DESC
       LIMIT 1
     ) p ON TRUE
     WHERE o.buyer_id = $1
     ORDER BY o.created_at DESC`,
    [buyerId]
  );

exports.getOrdersBySellerId = (sellerId) =>
  pool.query(
    `SELECT
       oi.id AS order_item_id,
       oi.order_id,
       oi.listing_id,
       oi.quantity,
       oi.price_cents_at_purchase,
       o.buyer_id,
       u.username AS buyer_username,
       o.total_cents,
       o.status AS order_status,
       o.created_at AS order_created_at,
       p.status AS payment_status
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN users u ON o.buyer_id = u.id
     LEFT JOIN LATERAL (
       SELECT status
       FROM payments
       WHERE order_id = o.id
       ORDER BY created_at DESC
       LIMIT 1
     ) p ON TRUE
     WHERE oi.seller_id = $1
     ORDER BY o.created_at DESC`,
    [sellerId]
  );

exports.updateOrderStatus = (orderId, status) =>
  pool.query(
    `UPDATE orders
     SET status = $2
     WHERE id = $1
     RETURNING *`,
    [orderId, status]
  );

