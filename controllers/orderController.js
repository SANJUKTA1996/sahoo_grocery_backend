const Order = require("../models/Order");

const generateOrderId = () =>
  `ORD${Math.floor(100000 + Math.random() * 900000)}`;

// POST /api/orders - create an order for the current user
const createOrder = async (req, res) => {
  try {
    const {
      items,
      address,
      subtotal,
      deliveryFee,
      discount,
      total,
      paymentMethod,
      transactionId,
      estimatedDelivery,
    } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Order items are required" });
    }

    if (total === undefined || total === null) {
      return res
        .status(400)
        .json({ success: false, message: "Order total is required" });
    }

    const itemCount = items.reduce(
      (sum, item) => sum + Number(item.qty || 0),
      0,
    );

    const order = await Order.create({
      user: req.userId,
      orderId: generateOrderId(),
      transactionId,
      items,
      address,
      subtotal,
      deliveryFee,
      discount,
      total,
      itemCount,
      paymentMethod,
      estimatedDelivery,
      status: "Processing",
    });

    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Create order error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create order" });
  }
};

// GET /api/orders/my - orders for the logged-in user only//Custome//
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({
      orderDate: -1,
    });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get my orders error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders" });
  }
};

// GET /api/orders - all orders (admin)
// const getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate("user", "name email")
//       .sort({ orderDate: -1 });
//     return res.status(200).json({ success: true, orders });
//   } catch (error) {
//     console.error("Get all orders error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch orders" });
//   }
// };
// GET /api/orders - all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ orderDate: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// GET /api/orders/:orderId - single order lookup
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId }).populate(
      "user",
      "name email",
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get order error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch order" });
  }
};

// PATCH /api/orders/:orderId/status - update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body || {};

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { returnDocument: "after" },
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Update order status error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update order status" });
  }
};

module.exports = {
  getMyOrders,
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
