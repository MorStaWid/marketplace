const { createItemListIfNotExists } = require("../models/itemList.model");
const { addItem, deleteItem, getItemsByUserId } = require("../models/item.model");

exports.getItems = async (req, res) => {
  try {
    const result = await getItemsByUserId(req.user.userId);
    return res.status(200).json({
      status: 200,
      message: "Items retrieved successfully.",
      data: result.rows,
    });
  } catch (err) {
    console.error("Get items error:", err);
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve items. Please try again later.",
    });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { name } = req.body;
    const listId = await createItemListIfNotExists(req.user.userId);
    await addItem(listId, name);
    return res.status(201).json({
      status: 201,
      message: "Item has been added to your list successfully.",
    });
  } catch (err) {
    console.error("Add item error:", err);
    return res.status(500).json({
      status: 500,
      message: "Failed to add item. Please try again later.",
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await deleteItem(req.params.id, req.user.userId);
    return res.status(200).json({
      status: 200,
      message: "Item has been deleted successfully.",
    });
  } catch (err) {
    console.error("Delete item error:", err);
    const status = err.code === "P2025" || err.message?.includes("not found") ? 404 : 500;
    const message =
      status === 404
        ? "Item not found. It may have already been deleted."
        : "Failed to delete item. Please try again later.";
    return res.status(status).json({ status, message });
  }
};
