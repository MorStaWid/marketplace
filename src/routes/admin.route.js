const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const {
  getUsers,
  deleteUser,
  blockUser,
  unblockUser
} = require("../controllers/admin.controller");

router.get("/get_user", auth, role("admin"), getUsers);
router.delete("/delete_user/:id", auth, role("admin"), deleteUser);
router.patch("/block_user/:id", auth, role("admin"), blockUser);
router.patch("/unblock_user/:id", auth, role("admin"), unblockUser);


module.exports = router;
