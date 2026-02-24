const pool = require("../config/db");

module.exports = async (req, res, next) => {
  const result = await pool.query(
    `SELECT is_blocked FROM users WHERE id = $1`,
    [req.user.userId]
  );

  if (result.rows[0]?.is_blocked) {
    return res.status(403).json({ message: "User blocked" });
  }

  next();
};
