const express = require("express");
const {
  getProducts,
  getProductsByCategory,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);
router.post("/", createProduct); // TODO: protect with admin auth middleware later
router.put("/:id", updateProduct); // TODO: protect with admin auth middleware later
router.delete("/:id", deleteProduct); // TODO: protect with admin auth middleware later

module.exports = router;
