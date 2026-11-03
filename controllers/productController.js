const Product = require("../models/Product");
const Restock = require("../models/Restock");
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

// GET /api/products/low-stock
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ updatedAt: -1 });

    const enriched = products.map((product) => {
      const minimumStock = Number(product.minimumStock ?? 10);
      const currentStock = Number(product.stock ?? 0);

      let status = "In Stock";
      if (currentStock <= 0) {
        status = "Out of Stock";
      } else if (currentStock <= minimumStock) {
        status = "Low Stock";
      }

      return {
        ...product.toObject(),
        minimumStock,
        stockStatus: status,
      };
    });

    const lowStockCount = enriched.filter(
      (product) => product.stockStatus === "Low Stock",
    ).length;
    const outOfStockCount = enriched.filter(
      (product) => product.stockStatus === "Out of Stock",
    ).length;

    return res.status(200).json({
      success: true,
      summary: {
        totalProducts: enriched.length,
        lowStockCount,
        outOfStockCount,
        restockRequiredCount: lowStockCount + outOfStockCount,
      },
      products: enriched,
    });
  } catch (error) {
    console.error("Get low stock products error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch low stock products" });
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
    const { name, category, price, stock, minimumStock, description, image } =
      req.body || {};

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
      minimumStock: minimumStock === undefined ? 10 : Number(minimumStock),
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
    const { name, category, price, stock, minimumStock, description, image } =
      req.body || {};

    const updateData = {
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category }),
      ...(price !== undefined && { price: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(minimumStock !== undefined && {
        minimumStock: Number(minimumStock),
      }),
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

//Restock product stock
const restockProduct = async (req, res) => {
  try {
    const { quantity, supplier, purchaseCost, restockDate, notes } =
      req.body || {};

    const qty = Number(quantity);

    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity to add is required and must be greater than 0",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const previousStock = Number(product.stock || 0);
    const newStock = previousStock + qty;

    product.stock = newStock;
    await product.save();

    const restock = await Restock.create({
      product: product._id,
      productName: product.name,
      quantityAdded: qty,
      previousStock,
      newStock,
      supplier: supplier || "",
      purchaseCost: Number(purchaseCost || 0),
      restockDate: restockDate ? new Date(restockDate) : new Date(),
      notes: notes || "",
      createdBy: "admin",
    });

    return res.status(200).json({
      success: true,
      message: "Stock restocked successfully",
      product,
      restock,
    });
  } catch (error) {
    console.error("Restock product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to restock product",
    });
  }
};

module.exports = {
  getProducts,
  getLowStockProducts,
  getProductsByCategory,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  restockProduct,
};
