const pool = require("../config/db");

exports.addOrIncrementCartItem = ({ cartId, listingId, quantity }) =>
  pool.query(
    `INSERT INTO cart_items (cart_id, listing_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, listing_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING *`,
    [cartId, listingId, quantity]
  );

exports.updateCartItemQuantity = ({ cartItemId, userId, quantity }) =>
  pool.query(
    `UPDATE cart_items ci
     SET quantity = $3
     FROM carts c
     WHERE ci.id = $1
       AND ci.cart_id = c.id
       AND c.user_id = $2
       AND c.status = 'active'
     RETURNING ci.*`,
    [cartItemId, userId, quantity]
  );

exports.removeCartItem = ({ cartItemId, userId }) =>
  pool.query(
    `DELETE FROM cart_items ci
     USING carts c
     WHERE ci.id = $1
       AND ci.cart_id = c.id
       AND c.user_id = $2
       AND c.status = 'active'`,
    [cartItemId, userId]
  );

