const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email && !password) return;
  if (!email || !password || password.length < 12) {
    throw new Error(
      "Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters",
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.role !== "admin") {
      throw new Error(
        "An account already exists with ADMIN_EMAIL. Choose a different admin email; existing account roles are not changed automatically.",
      );
    }
    return;
  }

  await User.create({
    name: "Store Administrator",
    email,
    password: await bcrypt.hash(password, 12),
    role: "admin",
  });
};

module.exports = seedAdmin;
