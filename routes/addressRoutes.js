const express = require("express");
const {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/addressController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getAddresses);
router.post("/", createAddress);
router.put("/", updateAddress);
router.delete("/", deleteAddress);

module.exports = router;
