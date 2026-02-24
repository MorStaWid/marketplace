const pool = require("../config/db");

exports.createItemListIfNotExists = async (userId) => {
  const existing = await pool.query(
    `SELECT id FROM item_lists WHERE user_id = $1`,
    [userId]
  );
  if (existing.rows.length) return existing.rows[0].id;

  const result = await pool.query(
    `INSERT INTO item_lists (user_id)
     VALUES ($1)
     RETURNING id`,
    [userId]
  );
  return result.rows[0].id;
};
