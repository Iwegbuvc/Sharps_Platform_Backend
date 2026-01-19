const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

const createCheckout = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    "items.product",
  );

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Stock validation
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return res.status(400).json({
        message: `Not enough stock for ${item.product.name}`,
      });
    }
  }

  // Create order
  const order = await Order.create({
    user: req.user.id,
    items: cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.priceAtTime,
      quantity: item.quantity,
      size: item.size,
    })),
    shippingAddress: req.body.shippingAddress,
    totalAmount: cart.totalPrice,
  });

  res.status(201).json({
    orderId: order._id,
    amount: order.totalAmount,
  });
};

module.exports = { createCheckout };
