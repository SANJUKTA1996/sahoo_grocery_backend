const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      default: "",
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["", "Male", "Female", "Other"],
      default: "",
    },
    role: {
      type: String,
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);