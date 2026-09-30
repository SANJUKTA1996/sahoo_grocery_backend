const express = require("express");
const {
  register,
  login,
  createAdminAccount,
  resetPassword,
  getMe,
  updateMe,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admins", protect, requireAdmin, createAdminAccount);
router.post("/reset-password", resetPassword);

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

module.exports = router;
