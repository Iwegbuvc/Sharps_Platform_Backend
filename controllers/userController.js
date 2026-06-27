const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/usersModel");
const BlacklistedToken = require("../models/blackListTokenModel"); // Needed for logout
const sendMail = require("../utilities/sendMail");
const {
  forgotPasswordMail,
  passwordResetConfirmationMail,
} = require("../utilities/mailGenerator");

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🔥 BLOCKED USER CHECK (THIS WAS MISSING)
    if (user.status === "Blocked") {
      return res.status(403).json({
        message: "Your account has been blocked. Contact support.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      message: "User login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!process.env.PASSWORD_RESET_TOKEN) {
      return res
        .status(500)
        .json({ message: "Password reset secret is not configured" });
    }

    const resetToken = jwt.sign(
      { email: user.email },
      process.env.PASSWORD_RESET_TOKEN,
      { expiresIn: "1h" },
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600 * 1000;
    await user.save();

    const html = forgotPasswordMail(user.name || "Customer", resetToken);
    await sendMail(
      user.email,
      "Reset Your Sharps Password",
      html,
    );

    return res.status(200).json({
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  const { resetToken, password } = req.body;

  if (!resetToken || !password) {
    return res.status(400).json({ message: "Enter required fields" });
  }

  try {
    const decoded = jwt.verify(resetToken, process.env.PASSWORD_RESET_TOKEN);

    const user = await User.findOne({
      email: decoded.email,
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "Please choose a new password different from your old one",
      });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    const html = passwordResetConfirmationMail(user.name || "Customer");
    await sendMail(
      user.email,
      "Your Sharps Password Was Changed",
      html,
    );

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset token has expired" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET PROFILE (protected)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGOUT USER (protected)
const logoutUser = async (req, res) => {
  const cookies = req.cookies;
  const authHeader = req.headers.authorization || "";
  const accessToken = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  // Blacklist access token
  if (accessToken) {
    try {
      const decoded = jwt.decode(accessToken);
      if (decoded?.exp) {
        await BlacklistedToken.create({
          token: accessToken,
          expiresAt: new Date(decoded.exp * 1000),
        });
      }
    } catch (err) {
      console.error("Access Token Blacklist Error:", err);
    }
  }

  // Remove refresh token from DB
  if (cookies?.refreshToken) {
    try {
      await User.updateOne(
        { refreshToken: cookies.refreshToken },
        { $pull: { refreshToken: cookies.refreshToken } },
      );
    } catch (err) {
      console.error("Refresh Token DB Cleanup Error:", err);
    }
  }

  // Clear refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "staging",
    sameSite: "strict",
  });

  return res.status(204).send(); // Logout successful
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  logoutUser,
};
