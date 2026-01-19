const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/usersModel");
const BlacklistedToken = require("../models/blackListTokenModel"); // Needed for logout

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
      { expiresIn: "7d" }
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

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Enter required fields" });

    const foundUser = await User.findOne({ email });
    if (!foundUser) return res.status(404).json({ message: "User not found" });

    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const accessToken = jwt.sign(
      { id: foundUser._id, role: foundUser.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "User login successful",
      token: accessToken,
      user: {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
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
        { $pull: { refreshToken: cookies.refreshToken } }
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

module.exports = { registerUser, loginUser, getProfile, logoutUser };
