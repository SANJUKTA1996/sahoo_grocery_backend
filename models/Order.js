const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: { type: String, required: true, unique: true },
    transactionId: { type: String },
    items: { type: [orderItemSchema], default: [] },
    address: { type: mongoose.Schema.Types.Mixed },
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    itemCount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: "cod" },
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Confirmed",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Processing",
    },
    estimatedDelivery: { type: String },
  },
  {
    // map createdAt to orderDate so it matches the field name used across the client
    timestamps: { createdAt: "orderDate", updatedAt: "updatedAt" },
  },
);

module.exports = mongoose.model("Order", orderSchema);
