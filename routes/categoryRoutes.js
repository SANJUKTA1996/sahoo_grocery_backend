const express = require("express");
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);
router.post("/", protect, requireAdmin, createCategory);
router.delete("/:slug", protect, requireAdmin, deleteCategory);

module.exports = router;
