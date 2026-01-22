// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middlewares/validateToken");

// Controllers
const {
  getAllUsers,
  toggleUserStatus,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} = require("../controllers/adminController");

// Dashboard Stats
router.get("/dashboard/stats", verifyToken, isAdmin, getDashboardStats);

// USERS
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.patch("/users/:id/status", verifyToken, isAdmin, toggleUserStatus);

// ORDERS
router.get("/orders", verifyToken, isAdmin, getAllOrders);
router.patch("/orders/:id/status", verifyToken, isAdmin, updateOrderStatus);

module.exports = router;
