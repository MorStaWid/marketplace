const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const block = require("../middleware/block.middleware");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} = require("../controllers/cart.controller");

router.get("/", auth, block, getCart);
router.post("/items", auth, block, addToCart);
router.patch("/items/:id", auth, block, updateCartItem);
router.delete("/items/:id", auth, block, removeCartItem);

module.exports = router;

