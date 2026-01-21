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

const connectDB = require("./db/config");

const app = express();

// Database connection
connectDB();

app.post(
  "/api/checkout/paystack/webhook",
  express.raw({ type: "application/json" }),
);
app.use(express.json());
app.use(cookieParser());
app.use(cors());

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
