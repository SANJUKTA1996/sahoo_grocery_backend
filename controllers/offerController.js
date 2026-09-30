const mongoose = require("mongoose");
const Offer = require("../models/Offer");
const Product = require("../models/Product");

const offerProducts = "name price image category stock";

const validateOffer = async (payload) => {
  const {
    title,
    subtitle,
    discountType,
    discountValue,
    products,
    startsAt,
    endsAt,
  } = payload || {};
  const numericValue = Number(discountValue);
  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);

  if (!title?.trim() || !subtitle?.trim()) {
    return "Offer title and description are required";
  }
  if (!["percentage", "fixed"].includes(discountType)) {
    return "Discount type must be percentage or fixed";
  }
  if (
    !Number.isFinite(numericValue) ||
    numericValue <= 0 ||
    (discountType === "percentage" && numericValue > 100)
  ) {
    return "Enter a valid discount value";
  }
  if (!Array.isArray(products) || products.length === 0) {
    return "Select at least one product";
  }
  if (products.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    return "One or more selected products are invalid";
  }
  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate <= startDate
  ) {
    return "Offer end date must be after its start date";
  }

  const productCount = await Product.countDocuments({ _id: { $in: products } });
  if (productCount !== new Set(products.map(String)).size) {
    return "One or more selected products could not be found";
  }

  return null;
};

const getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      active: true,
      startsAt: { $lte: now },
      endsAt: { $gte: now },
    })
      .populate({
        path: "products",
        select: offerProducts,
        match: { stock: { $gt: 0 } },
      })
      .sort({ endsAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      offers: offers
        .map((offer) => ({
          ...offer,
          products: offer.products.filter(Boolean),
        }))
        .filter((offer) => offer.products.length > 0),
    });
  } catch (error) {
    console.error("Get active offers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active offers",
    });
  }
};

const getActiveOfferById = async (req, res) => {
  try {
    const { offerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

    const now = new Date();
    const offer = await Offer.findOne({
      _id: offerId,
      active: true,
      startsAt: { $lte: now },
      endsAt: { $gte: now },
    })
      .populate({
        path: "products",
        select: offerProducts,
        match: { stock: { $gt: 0 } },
      })
      .lean();

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer is no longer available" });
    }

    const availableProducts = offer.products.filter(Boolean);
    if (availableProducts.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No products are currently available for this offer",
        });
    }

    return res.status(200).json({
      success: true,
      offer: { ...offer, products: availableProducts },
    });
  } catch (error) {
    console.error("Get active offer details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch offer products",
    });
  }
};

const getAdminOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("products", offerProducts)
      .sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, offers });
  } catch (error) {
    console.error("Get offers error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch offers" });
  }
};

const createOffer = async (req, res) => {
  try {
    const validationError = await validateOffer(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const offer = await Offer.create({
      ...req.body,
      title: req.body.title.trim(),
      subtitle: req.body.subtitle.trim(),
      discountValue: Number(req.body.discountValue),
    });
    await offer.populate("products", offerProducts);
    return res.status(201).json({ success: true, offer });
  } catch (error) {
    console.error("Create offer error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create offer" });
  }
};

const updateOffer = async (req, res) => {
  try {
    const validationError = await validateOffer(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const offer = await Offer.findByIdAndUpdate(
      req.params.offerId,
      {
        ...req.body,
        title: req.body.title.trim(),
        subtitle: req.body.subtitle.trim(),
        discountValue: Number(req.body.discountValue),
      },
      { new: true, runValidators: true },
    ).populate("products", offerProducts);

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

    return res.status(200).json({ success: true, offer });
  } catch (error) {
    console.error("Update offer error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update offer" });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.offerId);
    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }
    return res.status(200).json({ success: true, message: "Offer deleted" });
  } catch (error) {
    console.error("Delete offer error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete offer" });
  }
};

module.exports = {
  getActiveOffers,
  getActiveOfferById,
  getAdminOffers,
  createOffer,
  updateOffer,
  deleteOffer,
};
