const express = require("express");
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);
router.post("/", createCategory); // TODO: protect with admin auth middleware later

module.exports = router;
