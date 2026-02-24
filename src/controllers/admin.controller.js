const {
  getAll,
  deleteById,
  blockById,
  unblockById,
} = require("../models/user.model");

exports.getUsers = async (_, res) => {
  try {
    const users = await getAll();
    return res.status(200).json({
      status: 200,
      message: "Users retrieved successfully.",
      data: users.rows,
    });
  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve users. Please try again later.",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await deleteById(req.params.id);
    return res.status(200).json({
      status: 200,
      message: "User has been deleted successfully.",
    });
  } catch (err) {
    console.error("Delete user error:", err);
    const status = err.code === "P2025" || err.message?.includes("not found") ? 404 : 500;
    const message =
      status === 404
        ? "User not found. It may have already been deleted."
        : "Failed to delete user. Please try again later.";
    return res.status(status).json({ status, message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    await blockById(req.params.id);
    return res.status(200).json({
      status: 200,
      message: "User has been blocked successfully.",
    });
  } catch (err) {
    console.error("Block user error:", err);
    const status = err.code === "P2025" || err.message?.includes("not found") ? 404 : 500;
    const message =
      status === 404
        ? "User not found. Cannot block."
        : "Failed to block user. Please try again later.";
    return res.status(status).json({ status, message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    await unblockById(req.params.id);
    return res.status(200).json({
      status: 200,
      message: "User has been unblocked successfully.",
    });
  } catch (err) {
    console.error("Unblock user error:", err);
    const status = err.code === "P2025" || err.message?.includes("not found") ? 404 : 500;
    const message =
      status === 404
        ? "User not found. Cannot unblock."
        : "Failed to unblock user. Please try again later.";
    return res.status(status).json({ status, message });
  }
};