const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

const { verifyToken } = require("../middlewares/validateToken");

const router = express.Router();

// all cart routes require auth

router.get("/", verifyToken, getCart);
router.post("/add", verifyToken, addToCart);
router.put("/item/:itemId", verifyToken, updateCartItem);
router.delete("/item/:itemId", verifyToken, removeCartItem);
router.delete("/clear", verifyToken, clearCart);

module.exports = router;
