// controllers/adminUserController.js
const User = require("../models/usersModel");
const Order = require("../models/orderModel");
// const Product = require("../models/productModel");

// GET ALL USERS (Admin) with pagination, filters & search
const getAllUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 🔍 Build filters
    const filter = {};

    // Filter by role
    if (req.query.role) {
      filter.role = req.query.role; // user | admin
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status; // Active | Blocked
    }

    // Search by name or email
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // 👥 Fetch users
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 📊 Count for pagination
    const totalUsers = await User.countDocuments(filter);

    res.json({
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TOGGLE USER STATUS (Active / Blocked)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = user.status === "Active" ? "Blocked" : "Active";
    await user.save();

    res.json({ message: "User status updated", status: user.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL ORDERS (Admin) with pagination & filters
const getAllOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 🔍 Build filters dynamically
    const filter = {};

    // Filter by payment method
    if (req.query.paymentMethod) {
      filter.paymentMethod = req.query.paymentMethod; // Paystack | Pay on Delivery
    }

    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus; // paid | pending | failed
    }

    if (req.query.orderStatus) {
      filter.orderStatus = req.query.orderStatus; // processing | shipped | delivered | cancelled
    }

    // 📦 Query orders
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Add paymentMethod and mapped paymentStatus for frontend clarity
    const ordersWithPayment = orders.map((order) => {
      let mappedPaymentStatus = order.paymentStatus;
      if (
        order.paymentMethod === "Pay on Delivery" &&
        order.paymentStatus !== "paid"
      ) {
        mappedPaymentStatus = "Not Paid";
      } else if (
        order.paymentMethod === "Paystack" &&
        order.paymentStatus !== "paid"
      ) {
        mappedPaymentStatus = "Pending";
      }
      return {
        ...order,
        paymentMethod: order.paymentMethod || "Paystack",
        paymentStatus: mappedPaymentStatus,
      };
    });

    // 📊 Total count (for pagination)
    const totalOrders = await Order.countDocuments(filter);

    res.json({
      page,
      limit,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      orders: ordersWithPayment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["processing", "shipped", "delivered", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = status;

    if (status === "shipped") {
      order.shippedAt = new Date();
    }

    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      message: "Order status updated",
      orderStatus: order.orderStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET DASHBOARD STATS (total revenue, orders, products, recent orders)
const getDashboardStats = async (req, res) => {
  try {
    // Get all orders
    const orders = await Order.find();

    // Calculate total revenue
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0,
    );

    // Get total orders count
    const totalOrders = orders.length;

    // Get recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((order) => ({
        _id: order._id,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      }));

    // Get total products count
    const Product = require("../models/productModel");
    const totalProducts = await Product.countDocuments();

    // Get total users count
    const totalUsers = await User.countDocuments();

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

module.exports = {
  getAllUsers,
  toggleUserStatus,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
};
