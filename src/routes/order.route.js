const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const block = require("../middleware/block.middleware");
const {
  checkout,
  getBuyerOrders,
  getSellerOrders,
} = require("../controllers/order.controller");

router.post("/checkout", auth, block, checkout);
router.get("/buyer", auth, block, getBuyerOrders);
router.get("/seller", auth, block, getSellerOrders);

module.exports = router;

