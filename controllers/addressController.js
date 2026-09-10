const Address = require("../models/Address");

// GET /api/addresses - list current user's addresses
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("Get addresses error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch addresses" });
  }
};

// POST /api/addresses - create a new address for current user
const createAddress = async (req, res) => {
  try {
    const {
      name,
      phone,
      altPhone,
      address,
      nearby,
      pincode,
      city,
      state,
      type,
      isDefault,
    } = req.body || {};

    if (!name || !phone || !address || !pincode || !city) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, address, pincode and city are required",
      });
    }

    const existingCount = await Address.countDocuments({ user: req.userId });

    const newAddress = await Address.create({
      user: req.userId,
      name,
      phone,
      altPhone,
      address,
      nearby,
      pincode,
      city,
      state,
      type: type || "home",
      isDefault: Boolean(isDefault) || existingCount === 0,
    });

    if (newAddress.isDefault) {
      await Address.updateMany(
        { user: req.userId, _id: { $ne: newAddress._id } },
        { isDefault: false },
      );
    }

    return res.status(201).json({ success: true, address: newAddress });
  } catch (error) {
    console.error("Create address error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create address" });
  }
};

// PUT /api/addresses - update an address owned by current user (id sent in body)
const updateAddress = async (req, res) => {
  try {
    const { id } = req.body || {};

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Address id is required" });
    }

    const address = await Address.findOne({
      _id: id,
      user: req.userId,
    });

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    const updatableFields = [
      "name",
      "phone",
      "altPhone",
      "address",
      "nearby",
      "pincode",
      "city",
      "state",
      "type",
      "isDefault",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        address[field] = req.body[field];
      }
    });

    await address.save();

    if (address.isDefault) {
      await Address.updateMany(
        { user: req.userId, _id: { $ne: address._id } },
        { isDefault: false },
      );
    }

    return res.status(200).json({ success: true, address });
  } catch (error) {
    console.error("Update address error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update address" });
  }
};

// DELETE /api/addresses - delete an address owned by current user (id sent in body)
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.body || {};

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Address id is required" });
    }

    const address = await Address.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    if (address.isDefault) {
      const another = await Address.findOne({ user: req.userId });
      if (another) {
        another.isDefault = true;
        await another.save();
      }
    }

    return res.status(200).json({ success: true, message: "Address deleted" });
  } catch (error) {
    console.error("Delete address error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete address" });
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
