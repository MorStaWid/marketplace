const pool = require("../config/db");

exports.createUser = (username, email, hash, role) =>
  pool.query(
    `INSERT INTO users (username, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, role`,
    [username, email, hash, role]
  );

exports.findByEmail = (email) =>
  pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

exports.getAll = () =>
  pool.query(`SELECT id, username, email, role, is_blocked FROM users`);

exports.deleteById = (id) =>
  pool.query(`DELETE FROM users WHERE id = $1`, [id]);

exports.blockById = (id) =>
  pool.query(`UPDATE users SET is_blocked = true WHERE id = $1`, [id]);

exports.unblockById = (id) =>
  pool.query(`UPDATE users SET is_blocked = false WHERE id = $1`, [id]);