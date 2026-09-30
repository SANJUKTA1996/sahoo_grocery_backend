const express = require("express");
const {
  getActiveOffers,
  getActiveOfferById,
  getAdminOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} = require("../controllers/offerController");
const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/active", getActiveOffers);
router.get("/active/:offerId", getActiveOfferById);
router.get("/admin", protect, requireAdmin, getAdminOffers);
router.post("/", protect, requireAdmin, createOffer);
router.put("/:offerId", protect, requireAdmin, updateOffer);
router.delete("/:offerId", protect, requireAdmin, deleteOffer);

module.exports = router;
