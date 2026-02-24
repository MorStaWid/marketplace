const pool = require("../config/db");

exports.addItem = (listId, name) =>
  pool.query(
    `INSERT INTO items (item_list_id, name)
     VALUES ($1, $2)`,
    [listId, name]
  );

exports.getItemsByUserId = (userId) =>
  pool.query(
    `SELECT items.id, items.name
     FROM items
     JOIN item_lists ON items.item_list_id = item_lists.id
     WHERE item_lists.user_id = $1
     ORDER BY items.id`,
    [userId]
  );

exports.deleteItem = (itemId, userId) =>
  pool.query(
    `DELETE FROM items
     USING item_lists
     WHERE items.item_list_id = item_lists.id
     AND items.id = $1
     AND item_lists.user_id = $2`,
    [itemId, userId]
  );
