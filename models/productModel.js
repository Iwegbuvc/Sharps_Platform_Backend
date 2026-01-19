const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: String,
  altText: String,
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },

    category: {
      type: String,
      enum: ["accessories", "shirts", "shoes", "electronics"],
      required: true,
    },

    gender: {
      type: String,
      enum: ["men", "women", "unisex"],
      required: true,
    },

    sizes: {
      type: [String],
      default: [],
    },

    images: {
      type: [imageSchema],
      required: true,
    },

    newProduct: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// productSchema.index({
//   name: "text",
//   description: "text",
//   category: "text",
// });
module.exports = mongoose.model("Product", productSchema);
