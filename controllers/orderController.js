const Order = require("../models/Order");
const Product = require("../models/Product");

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
      items: items.map((item) => ({
        ...item,
        productId: item.productId || item._id || item.id,
      })),
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

// GET /api/orders/my/buy-again - available products from the current user's order history
const getBuyAgainProducts = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.userId,
      status: { $ne: "Cancelled" },
    })
      .select("items orderDate")
      .sort({ orderDate: -1 })
      .lean();

    const normalizeName = (name = "") => name.trim().toLowerCase();
    const purchasesById = new Map();
    const purchasesByName = new Map();

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const purchase = {
          quantity: Number(item.qty || 0),
          lastPurchasedAt: order.orderDate,
        };
        const productId = item.productId || item.id || item._id;
        const nameKey = normalizeName(item.name);

        if (productId) {
          const existing = purchasesById.get(String(productId)) || {
            quantity: 0,
            lastPurchasedAt: null,
          };
          existing.quantity += purchase.quantity;
          existing.lastPurchasedAt ||= purchase.lastPurchasedAt;
          purchasesById.set(String(productId), existing);
        } else if (nameKey) {
          const existing = purchasesByName.get(nameKey) || {
            quantity: 0,
            lastPurchasedAt: null,
          };
          existing.quantity += purchase.quantity;
          existing.lastPurchasedAt ||= purchase.lastPurchasedAt;
          purchasesByName.set(nameKey, existing);
        }
      });
    });

    const products = await Product.find({ stock: { $gt: 0 } }).lean();
    const recommendations = products
      .map((product) => {
        const purchase =
          purchasesById.get(String(product._id)) ||
          purchasesByName.get(normalizeName(product.name));

        return purchase
          ? {
              ...product,
              purchaseCount: purchase.quantity,
              lastPurchasedAt: purchase.lastPurchasedAt,
            }
          : null;
      })
      .filter(Boolean)
      .sort(
        (first, second) =>
          second.purchaseCount - first.purchaseCount ||
          new Date(second.lastPurchasedAt) - new Date(first.lastPurchasedAt),
      )
      .slice(0, 8);

    return res.status(200).json({ success: true, products: recommendations });
  } catch (error) {
    console.error("Get buy-again products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch previously purchased products",
    });
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
  getBuyAgainProducts,
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
