const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const {
  validateNewUser,
  validateLogin,
  validatePassword,
} = require("../middlewares/validate");
const { verifyToken } = require("../middlewares/validateToken");
const { authLimiter } = require("../middlewares/rateLimiter");

router.post("/register", authLimiter, validateNewUser, registerUser);
router.post("/login", authLimiter, validateLogin, loginUser);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, validatePassword, resetPassword);
// 🔐 Protected profile route
router.get("/myProfile", verifyToken, getProfile);
router.post("/logout", verifyToken, logoutUser);

module.exports = router;
