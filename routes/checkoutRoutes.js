const express = require("express");
const { paystackWebhook } = require("../controllers/paystackwebhookController");
const {
  createCheckout,
  verifyPayment,
  initializePayment,
  getOrderById,
} = require("../controllers/checkoutController");
const { verifyToken } = require("../middlewares/validateToken");

const router = express.Router();

router.post("/paystack/webhook", paystackWebhook);

// Create order from cart
router.post("/", verifyToken, createCheckout);

router.post("/initialize", verifyToken, initializePayment);

// Verify Paystack payment
router.post("/verify", verifyToken, verifyPayment);

module.exports = router;
