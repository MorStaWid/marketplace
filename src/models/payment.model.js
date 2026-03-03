const pool = require("../config/db");

exports.createPayment = ({ orderId, provider = "stripe", providerPaymentId = null, status = "succeeded" }) =>
  pool.query(
    `INSERT INTO payments (order_id, provider, provider_payment_id, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [orderId, provider, providerPaymentId, status]
  );

exports.updatePaymentStatus = (paymentId, status) =>
  pool.query(
    `UPDATE payments
     SET status = $2
     WHERE id = $1
     RETURNING *`,
    [paymentId, status]
  );

exports.getPaymentsByOrderId = (orderId) =>
  pool.query(
    `SELECT *
     FROM payments
     WHERE order_id = $1
     ORDER BY created_at DESC`,
    [orderId]
  );

