const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const block = require("../middleware/block.middleware");
const {
  getListings,
  createListing,
  getMyListings,
} = require("../controllers/listing.controller");

// Public browse of active listings
router.get("/", getListings);

// Authenticated seller actions
router.post("/", auth, block, createListing);
router.get("/mine", auth, block, getMyListings);

module.exports = router;

