const { getOrCreateActiveCart, getCartWithItems } = require("../models/cart.model");
const {
  addOrIncrementCartItem,
  updateCartItemQuantity,
  removeCartItem,
} = require("../models/cartItem.model");

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await getCartWithItems(userId);
    return res.status(200).json({
      status: 200,
      message: "Cart retrieved successfully.",
      data: result,
    });
  } catch (err) {
    console.error("Get cart error:", err);
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve cart. Please try again later.",
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { listingId, quantity } = req.body;

    const parsedListingId = Number(listingId);
    const parsedQuantity = Number(quantity) || 1;

    if (!Number.isInteger(parsedListingId) || parsedListingId <= 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid listing id.",
      });
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        status: 400,
        message: "Quantity must be a positive integer.",
      });
    }

    const cart = await getOrCreateActiveCart(userId);
    await addOrIncrementCartItem({
      cartId: cart.id,
      listingId: parsedListingId,
      quantity: parsedQuantity,
    });

    const updated = await getCartWithItems(userId);

    return res.status(201).json({
      status: 201,
      message: "Item added to cart.",
      data: updated,
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    return res.status(500).json({
      status: 500,
      message: "Failed to add item to cart. Please try again later.",
    });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cartItemId = Number(req.params.id);
    const { quantity } = req.body;

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid cart item id.",
      });
    }

    if (!Number.isInteger(parsedQuantity)) {
      return res.status(400).json({
        status: 400,
        message: "Quantity must be an integer.",
      });
    }

    if (parsedQuantity <= 0) {
      await removeCartItem({ cartItemId, userId });
    } else {
      const result = await updateCartItemQuantity({
        cartItemId,
        userId,
        quantity: parsedQuantity,
      });

      if (!result.rows.length) {
        return res.status(404).json({
          status: 404,
          message: "Cart item not found.",
        });
      }
    }

    const updated = await getCartWithItems(userId);

    return res.status(200).json({
      status: 200,
      message: "Cart updated successfully.",
      data: updated,
    });
  } catch (err) {
    console.error("Update cart item error:", err);
    return res.status(500).json({
      status: 500,
      message: "Failed to update cart item. Please try again later.",
    });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cartItemId = Number(req.params.id);

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid cart item id.",
      });
    }

    await removeCartItem({ cartItemId, userId });

    const updated = await getCartWithItems(userId);

    return res.status(200).json({
      status: 200,
      message: "Item removed from cart.",
      data: updated,
    });
  } catch (err) {
    console.error("Remove cart item error:", err);
    return res.status(500).json({
      status: 500,
      message: "Failed to remove item from cart. Please try again later.",
    });
  }
};

