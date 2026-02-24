const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const block = require("../middleware/block.middleware");
const { getItems, addItem, deleteItem } = require("../controllers/user.controller");

router.get("/items", auth, block, getItems);
router.post("/add_item", auth, block, addItem);
router.delete("/delete_item/:id", auth, block, deleteItem);

module.exports = router;
