// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middlewares/validateToken");
const {
  adminLimiter,
  searchLimiter,
  createUpdateLimiter,
} = require("../middlewares/rateLimiter");

// Controllers
const {
  getAllUsers,
  toggleUserStatus,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} = require("../controllers/adminController");

// Dashboard Stats
router.get(
  "/dashboard/stats",
  verifyToken,
  isAdmin,
  adminLimiter,
  getDashboardStats,
);

// USERS
router.get("/users", verifyToken, isAdmin, adminLimiter, getAllUsers);
router.patch(
  "/users/:id/status",
  verifyToken,
  isAdmin,
  createUpdateLimiter,
  toggleUserStatus,
);

// ORDERS
router.get("/orders", verifyToken, isAdmin, adminLimiter, getAllOrders);
router.patch(
  "/orders/:id/status",
  verifyToken,
  isAdmin,
  createUpdateLimiter,
  updateOrderStatus,
);

module.exports = router;
