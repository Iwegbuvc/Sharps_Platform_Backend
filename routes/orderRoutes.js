const express = require("express");
const { verifyToken } = require("../middlewares/validateToken");
const { getMyOrders, getOrderById } = require("../controllers/orderController");

const router = express.Router();

router.get("/my-orders", verifyToken, getMyOrders);
router.get("/:id", verifyToken, getOrderById);

module.exports = router;
