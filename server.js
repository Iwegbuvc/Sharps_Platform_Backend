require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { generalLimiter } = require("./middlewares/rateLimiter");

const connectDB = require("./db/config");
const paystackWebhook = require("./controllers/paystackwebhookController");

const app = express();

// 🔹 Fix for Express behind a proxy (Render)
app.set("trust proxy", 1);

// Database connection
connectDB();

// Parse Paystack webhook first (needs raw body)
app.post(
  "/api/checkout/paystack/webhook",
  express.raw({ type: "application/json" }),
  paystackWebhook,
);

// Standard middleware
app.use(express.json());
app.use(cookieParser());

// 🔹 CORS config
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "https://sharps-platform-zqio.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);

      // Match origin ignoring trailing slash
      if (allowedOrigins.some((o) => origin.startsWith(o))) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// 🔒 Apply general rate limiter to all API routes
app.use("/api/", generalLimiter);

// Basic route
app.get("/", (req, res) => {
  res.send("Welcome to Sharps Platform");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/admin", adminRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
