// const mongoose = require("mongoose");

// const imageSchema = new mongoose.Schema({
//   url: String,
//   altText: String,
// });

// const productSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     description: { type: String, required: true },
//     price: { type: Number, required: true },
//     stock: { type: Number, required: true, default: 0 },

//     category: {
//       type: String,
//       enum: [
//         "accessories",
//         "shirts",
//         "trousers",
//         "shoes",
//         "artifacts",
//         "interiors",
//         "others",
//       ],
//       required: true,
//     },

//     gender: {
//       type: String,
//       enum: ["men", "women", "unisex"],
//       required: true,
//     },

//     sizes: {
//       type: [String],
//       default: [],
//     },

//     images: {
//       type: [imageSchema],
//       required: true,
//     },

//     isNew: { type: Boolean, default: false },
//     featured: { type: Boolean, default: false },
//   },
//   { timestamps: true },
// );

// productSchema.index({
//   name: "text",
//   description: "text",
//   category: "text",
// });
// module.exports = mongoose.model("Product", productSchema);

// NEW UPDATE

const mongoose = require("mongoose");

const normalizeCategoryValue = (value) => {
  if (typeof value !== "string") return value;

  const normalized = value.trim().toLowerCase();
  const mapping = {
    accessories: "clothing",
    shirts: "clothing",
    trousers: "clothing",
    shoes: "clothing",
    cloth: "clothing",
    clothes: "clothing",
    artifacts: "interiors",
    others: "interiors",
    interior: "interiors",
  };

  return mapping[normalized] || normalized;
};

const normalizeSubcategoryValue = (value) => {
  if (typeof value !== "string") return value;

  const normalized = value.trim().toLowerCase();
  const mapping = {
    pants: "pants-joggers",
    joggers: "pants-joggers",
    jewelery: "jewelries",
    jewellery: "jewelries",
    "big light": "big-lights",
    "small light": "small-lights",
  };

  return mapping[normalized] || normalized;
};

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
      enum: [
        "interiors",
        "clothing",
        "accessories",
        "shirts",
        "shoes",
        "artifacts",
        "others",
        "trousers",
        "cloth",
        "clothes",
        "interior",
      ],
      required: true,
      trim: true,
      set: normalizeCategoryValue,
    },

    subcategory: {
      type: String,
      enum: [
        // Interiors
        "frames",
        "big-lights",
        "small-lights",
        "couch",
        "tables",
        "clocks",
        "books",
        "figurines",
        "plants",
        "rugs",
        "scents",
        "other-artifacts",
        // Clothing
        "shoes",
        "shirts",
        "bags",
        "pants-joggers",
        "jeans",
        "slides",
        "jewelries",
        "other-accessories",
        "pants",
        "joggers",
        "jewelery",
        "jewellery",
        "big light",
        "small light",
      ],
      required: true,
      trim: true,
      set: normalizeSubcategoryValue,
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

    isNew: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

productSchema.index({
  name: "text",
  description: "text",
  category: "text",
});
module.exports = mongoose.model("Product", productSchema);
