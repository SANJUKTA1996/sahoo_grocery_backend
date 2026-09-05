const Category = require("../models/Category");

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
};

// GET /api/categories/:slug
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({ success: true, category });
  } catch (error) {
    console.error("Get category error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch category" });
  }
};

// POST /api/categories (admin only)
const createCategory = async (req, res) => {
  try {
    const { name, slug, image } = req.body || {};

    if (!name || !slug || !image) {
      return res
        .status(400)
        .json({ success: false, message: "Name, slug and image are required" });
    }

    const existing = await Category.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Category slug already exists" });
    }

    const category = await Category.create({
      name,
      slug: slug.toLowerCase(),
      image,
    });

    return res
      .status(201)
      .json({ success: true, message: "Category created", category });
  } catch (error) {
    console.error("Create category error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create category" });
  }
};

module.exports = { getCategories, getCategoryBySlug, createCategory };
