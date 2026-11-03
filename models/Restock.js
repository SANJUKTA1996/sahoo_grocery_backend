const mongoose = require("mongoose");

const restockSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantityAdded: {
      type: Number,
      required: true,
      min: 1,
    },
    previousStock: {
      type: Number,
      required: true,
      min: 0,
    },
    newStock: {
      type: Number,
      required: true,
      min: 0,
    },
    supplier: {
      type: String,
      default: "",
    },
    purchaseCost: {
      type: Number,
      default: 0,
    },
    restockDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
    createdBy: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Restock", restockSchema);
