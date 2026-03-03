const {
  createListing,
  getAllActiveListings,
  getListingsBySellerId,
} = require("../models/listing.model");

exports.getListings = async (req, res) => {
  try {
    const result = await getAllActiveListings();
    return res.status(200).json({
      status: 200,
      message: "Listings retrieved successfully.",
      data: result.rows,
    });
  } catch (err) {
    console.error("Get listings error:", err);
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve listings. Please try again later.",
    });
  }
};

exports.createListing = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { title, description, priceCents, quantityAvailable } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        status: 400,
        message: "Title is required.",
      });
    }

    const parsedPrice = Number(priceCents);
    const parsedQuantity = Number(quantityAvailable);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        status: 400,
        message: "Price (in cents) must be a non-negative number.",
      });
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({
        status: 400,
        message: "Quantity must be a non-negative integer.",
      });
    }

    const result = await createListing({
      sellerId,
      title: title.trim(),
      description: description?.trim() || null,
      priceCents: parsedPrice,
      quantityAvailable: parsedQuantity,
    });

    return res.status(201).json({
      status: 201,
      message: "Listing created successfully.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Create listing error:", err);
    return res.status(500).json({
      status: 500,
      message: "Failed to create listing. Please try again later.",
    });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const result = await getListingsBySellerId(sellerId);

    return res.status(200).json({
      status: 200,
      message: "Your listings retrieved successfully.",
      data: result.rows,
    });
  } catch (err) {
    console.error("Get my listings error:", err);
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve your listings. Please try again later.",
    });
  }
};

