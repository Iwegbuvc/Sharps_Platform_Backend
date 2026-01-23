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

// Database connection
connectDB();

app.post(
  "/api/checkout/paystack/webhook",
  express.raw({ type: "application/json" }),
  paystackWebhook,
);
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://sharps-platform-zqio.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, Paystack webhook)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// app.use(
//   // Allow configured frontend plus common local dev origins.
//   // Use a dynamic origin function so browser preflight checks succeed.
//   cors({
//     origin: function (origin, callback) {
//       const allowed = [process.env.FRONTEND_URL];
//       // include localhost dev origins
//       allowed.push(
//         "http://localhost:5173",
//         "http://localhost:3000",
//         "http://localhost:5174",
//       );
//       // allow requests with no origin (eg. curl, mobile apps)
//       if (!origin) return callback(null, true);
//       if (allowed.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   }),
// );

// 🔒 Apply general rate limiter to all API routes
app.use("/api/", generalLimiter);

const PORT = process.env.PORT || 9000;

app.get("/", (req, res) => {
  res.send("Welcome to Sharps Platform");
});

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
