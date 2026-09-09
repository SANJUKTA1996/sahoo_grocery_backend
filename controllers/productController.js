const Product = require("../models/Product");

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get products error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
};

// GET /api/products/category/:category
const getProductsByCategory = async (req, res) => {
  try {
    const normalize = (str) =>
      str
        .toLowerCase()
        .replace(/&/g, "")
        .replace(/[\s-]+/g, "");

    const targetCategory = normalize(req.params.category);

    const allProducts = await Product.find();
    const products = allProducts.filter(
      (product) => normalize(product.category) === targetCategory,
    );

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get products by category error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
};

// POST /api/products (admin only)
const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, description, image } = req.body || {};

    if (
      !name ||
      !category ||
      price === undefined ||
      stock === undefined ||
      !image
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, category, price, stock and image are required",
      });
    }

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      description,
      image, // base64 string, stored as-is
    });

    return res
      .status(201)
      .json({ success: true, message: "Product created", product });
  } catch (error) {
    console.error("Create product error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create product" });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Get product error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch product" });
  }
};

// PUT /api/products/:id (admin only)
const updateProduct = async (req, res) => {
  try {
    const { name, category, price, stock, description, image } = req.body || {};

    const updateData = {
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category }),
      ...(price !== undefined && { price: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(description !== undefined && { description }),
      ...(image && { image }),
    };

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Product updated", product });
  } catch (error) {
    console.error("Update product error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update product" });
  }
};

// DELETE /api/products/:id (admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete product" });
  }
};

module.exports = {
  getProducts,
  getProductsByCategory,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};
