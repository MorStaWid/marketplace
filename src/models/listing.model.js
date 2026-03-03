const pool = require("../config/db");

exports.createListing = ({ sellerId, title, description, priceCents, quantityAvailable }) =>
  pool.query(
    `INSERT INTO listings (seller_id, title, description, price_cents, quantity_available)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [sellerId, title, description ?? null, priceCents, quantityAvailable]
  );

exports.getAllActiveListings = () =>
  pool.query(
    `SELECT l.*, u.username AS seller_username
     FROM listings l
     JOIN users u ON l.seller_id = u.id
     WHERE l.status = 'active'
     ORDER BY l.created_at DESC`
  );

exports.getListingById = (id) =>
  pool.query(
    `SELECT l.*, u.username AS seller_username
     FROM listings l
     JOIN users u ON l.seller_id = u.id
     WHERE l.id = $1`,
    [id]
  );

exports.getListingsBySellerId = (sellerId) =>
  pool.query(
    `SELECT *
     FROM listings
     WHERE seller_id = $1
     ORDER BY created_at DESC`,
    [sellerId]
  );

exports.updateListingStatus = (id, status) =>
  pool.query(
    `UPDATE listings
     SET status = $2
     WHERE id = $1
     RETURNING *`,
    [id, status]
  );

exports.decrementListingQuantity = (id, quantity) =>
  pool.query(
    `UPDATE listings
     SET quantity_available = quantity_available - $2,
         status = CASE
                    WHEN quantity_available - $2 <= 0 THEN 'sold'
                    ELSE status
                  END
     WHERE id = $1
       AND quantity_available >= $2
     RETURNING *`,
    [id, quantity]
  );

