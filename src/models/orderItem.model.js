const pool = require("../config/db");

exports.createOrderItem = ({ orderId, listingId, sellerId, quantity, priceCentsAtPurchase }) =>
  pool.query(
    `INSERT INTO order_items (order_id, listing_id, seller_id, quantity, price_cents_at_purchase)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [orderId, listingId, sellerId, quantity, priceCentsAtPurchase]
  );

exports.createOrderItemsBulk = async ({ orderId, items }) => {
  const values = [];
  const params = [];

  items.forEach((item, index) => {
    const offset = index * 5;
    params.push(
      orderId,
      item.listingId,
      item.sellerId,
      item.quantity,
      item.priceCentsAtPurchase
    );
    values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`);
  });

  if (!values.length) return { rows: [] };

  return pool.query(
    `INSERT INTO order_items (order_id, listing_id, seller_id, quantity, price_cents_at_purchase)
     VALUES ${values.join(", ")}
     RETURNING *`,
    params
  );
};

exports.getOrderItemsByOrderId = (orderId) =>
  pool.query(
    `SELECT *
     FROM order_items
     WHERE order_id = $1`,
    [orderId]
  );

