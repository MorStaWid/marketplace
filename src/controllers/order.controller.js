const pool = require("../config/db");
const { getCartWithItems } = require("../models/cart.model");
const { getOrdersByBuyerId, getOrdersBySellerId } = require("../models/order.model");

exports.checkout = async (req, res) => {
  const userId = req.user.userId;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cartResult = await client.query(
      `SELECT *
       FROM carts
       WHERE user_id = $1
         AND status = 'active'
       LIMIT 1
       FOR UPDATE`,
      [userId]
    );

    if (!cartResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        status: 400,
        message: "No active cart found.",
      });
    }

    const cart = cartResult.rows[0];

    const itemsResult = await client.query(
      `SELECT
         ci.id AS cart_item_id,
         ci.quantity,
         l.id AS listing_id,
         l.seller_id,
         l.price_cents,
         l.quantity_available,
         l.status AS listing_status
       FROM cart_items ci
       JOIN listings l ON ci.listing_id = l.id
       WHERE ci.cart_id = $1
       FOR UPDATE`,
      [cart.id]
    );

    const items = itemsResult.rows;

    if (!items.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        status: 400,
        message: "Your cart is empty.",
      });
    }

    for (const item of items) {
      if (item.listing_status !== "active") {
        await client.query("ROLLBACK");
        return res.status(400).json({
          status: 400,
          message: "One or more items in your cart are no longer available.",
        });
      }
      if (item.quantity > item.quantity_available) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          status: 400,
          message: "One or more items in your cart do not have enough quantity available.",
        });
      }
    }

    const totalCents = items.reduce(
      (sum, item) => sum + item.price_cents * item.quantity,
      0
    );

    const orderResult = await client.query(
      `INSERT INTO orders (buyer_id, total_cents, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [userId, totalCents]
    );
    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, listing_id, seller_id, quantity, price_cents_at_purchase)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.listing_id, item.seller_id, item.quantity, item.price_cents]
      );
    }

    for (const item of items) {
      await client.query(
        `UPDATE listings
         SET quantity_available = quantity_available - $2,
             status = CASE
                        WHEN quantity_available - $2 <= 0 THEN 'sold'
                        ELSE status
                      END
         WHERE id = $1`,
        [item.listing_id, item.quantity]
      );
    }

    await client.query(
      `INSERT INTO payments (order_id, provider, status)
       VALUES ($1, 'stripe', 'succeeded')`,
      [order.id]
    );

    await client.query(
      `UPDATE orders SET status = 'paid' WHERE id = $1`,
      [order.id]
    );

    await client.query(
      `DELETE FROM cart_items
       WHERE cart_id = $1`,
      [cart.id]
    );

    await client.query(
      `UPDATE carts
       SET status = 'abandoned',
           updated_at = now()
       WHERE id = $1`,
      [cart.id]
    );

    await client.query("COMMIT");

    const summary = await getCartWithItems(userId);

    return res.status(201).json({
      status: 201,
      message: "Checkout completed successfully.",
      data: {
        order: { ...order, status: "paid" },
        totalCents,
        cart: summary.cart,
        items: summary.items,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Checkout error:", err);
    return res.status(500).json({
      status: 500,
      message: "Checkout failed. Please try again later.",
    });
  } finally {
    client.release();
  }
};

exports.getBuyerOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await getOrdersByBuyerId(userId);

    return res.status(200).json({
      status: 200,
      message: "Buyer orders retrieved successfully.",
      data: result.rows,
    });
  } catch (err) {
    console.error("Get buyer orders error:", err);
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve buyer orders. Please try again later.",
    });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await getOrdersBySellerId(userId);

    return res.status(200).json({
      status: 200,
      message: "Seller orders retrieved successfully.",
      data: result.rows,
    });
  } catch (err) {
    console.error("Get seller orders error:", err);
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve seller orders. Please try again later.",
    });
  }
};

