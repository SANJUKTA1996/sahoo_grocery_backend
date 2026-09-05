const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    description: { type: String, trim: true, default: "" },
    image: { type: String, required: true }, // base64 data URL
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
