const fs = require("fs");
const Product = require("../models/productModel");
const cloudinary = require("../config/cloudinary");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      gender,
      sizes,
      isNew,
      featured,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Images are required" });
    }

    // Upload images to Cloudinary & delete temp files
    const images = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });

        fs.unlinkSync(file.path);

        return {
          url: result.secure_url,
          altText: name,
        };
      }),
    );

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      gender,
      sizes: sizes ? sizes.split(",") : [],
      isNew,
      featured,
      images,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const getProducts = async (req, res) => {
//   try {
//     const {
//       category,
//       gender,
//       isNew,
//       featured,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const filter = {};
//     if (category) filter.category = category;
//     if (gender) filter.gender = gender;
//     if (isNew) filter.isNew = isNew === "true";
//     if (featured) filter.featured = featured === "true";

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const products = await Product.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Product.countDocuments(filter);

//     res.json({
//       page: parseInt(page),
//       limit: parseInt(limit),
//       total,
//       totalPages: Math.ceil(total / limit),
//       products,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getProducts = async (req, res) => {
  try {
    const {
      category,
      gender,
      isNew,
      featured,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (gender) filter.gender = gender;
    if (isNew) filter.isNew = isNew === "true";
    if (featured) filter.featured = featured === "true";

    // 🔍 SEARCH LOGIC
    if (search && search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    // Using text index for larger product
    // if (search && search.trim() !== "") {
    //   filter.$text = { $search: search };
    // }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const {
      name,
      description,
      price,
      stock,
      category,
      gender,
      sizes,
      isNew,
      featured,
    } = req.body;

    // Update text fields
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;
    product.category = category ?? product.category;
    product.gender = gender ?? product.gender;
    product.sizes = sizes ? sizes.split(",") : product.sizes;
    product.isNew = isNew ?? product.isNew;
    product.featured = featured ?? product.featured;

    // If new images uploaded → replace old ones
    if (req.files && req.files.length > 0) {
      // delete old cloudinary images
      for (const img of product.images) {
        const publicId = img.url.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      }

      const images = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
          });

          fs.unlinkSync(file.path);

          return {
            url: result.secure_url,
            altText: product.name,
          };
        }),
      );

      product.images = images;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from Cloudinary
    for (const img of product.images) {
      const publicId = img.url.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`products/${publicId}`);
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
};
