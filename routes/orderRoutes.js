const express = require("express");
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders); // add this line ABOVE "/:orderId"
router.get("/", getAllOrders); // TODO: protect with admin auth middleware later
router.get("/:orderId", getOrderById);
router.patch("/:orderId/status", updateOrderStatus); // TODO: protect with admin auth middleware later

module.exports = router;
