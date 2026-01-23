const express = require("express");
const paystackWebhook = require("../controllers/paystackwebhookController");
const {
  createCheckout,
  verifyPayment,
  initializePayment,
  getOrderById,
} = require("../controllers/checkoutController");
const { verifyToken } = require("../middlewares/validateToken");
const {
  checkoutLimiter,
  webhookLimiter,
} = require("../middlewares/rateLimiter");

const router = express.Router();

router.post("/paystack/webhook", webhookLimiter, paystackWebhook);

// Create order from cart
router.post("/", verifyToken, checkoutLimiter, createCheckout);

router.post("/initialize", verifyToken, checkoutLimiter, initializePayment);

// Verify Paystack payment
router.post("/verify", verifyToken, checkoutLimiter, verifyPayment);

module.exports = router;
