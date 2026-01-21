// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middlewares/validateToken");

// Controllers
const {
  getAllUsers,
  toggleUserStatus,
} = require("../controllers/adminController");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const {
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/adminController");

// ----------------- USERS -----------------
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.patch("/users/:id/status", verifyToken, isAdmin, toggleUserStatus);

// ----------------- PRODUCTS -----------------
router.post("/products", verifyToken, isAdmin, createProduct);
router.get("/products", verifyToken, isAdmin, getProducts);
router.get("/products/:id", verifyToken, isAdmin, getProductById);
router.put("/products/:id", verifyToken, isAdmin, updateProduct);
router.delete("/products/:id", verifyToken, isAdmin, deleteProduct);

// ----------------- ORDERS -----------------
router.get("/orders", verifyToken, isAdmin, getAllOrders);
router.patch("/orders/:id/status", verifyToken, isAdmin, updateOrderStatus);

module.exports = router;
