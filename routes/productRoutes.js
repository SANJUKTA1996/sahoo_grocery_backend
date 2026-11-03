const express = require("express");
const {
  getProducts,
  getLowStockProducts,
  getProductsByCategory,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  restockProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);
router.get("/low-stock", getLowStockProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);
router.post("/", createProduct); // TODO: protect with admin auth middleware later
router.put("/:id", updateProduct); // TODO: protect with admin auth middleware later
router.delete("/:id", deleteProduct); // TODO: protect with admin auth middleware later
router.post("/:id/restock", restockProduct); // TODO: protect with admin auth middleware later
module.exports = router;
