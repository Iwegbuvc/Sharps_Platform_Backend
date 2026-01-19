const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
} = require("../controllers/userController");
const { validateNewUser, validateLogin } = require("../middlewares/validate");
const { verifyToken } = require("../middlewares/validateToken");

router.post("/register", validateNewUser, registerUser);
router.post("/login", validateLogin, loginUser);
// 🔐 Protected profile route
router.get("/myProfile", verifyToken, getProfile);
router.post("/logout", verifyToken, logoutUser);

module.exports = router;
