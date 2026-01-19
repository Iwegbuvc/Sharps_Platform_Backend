const express = require("express");
const upload = require("../middlewares/upload");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { verifyToken, isAdmin } = require("../middlewares/validateToken");

const router = express.Router();

/* 🔓 PUBLIC ROUTES *Anyone can view products*/
router.get("/getProducts", getProducts);
router.get("/getProduct/:id", getProductById);

/**ADMIN-ONLY ROUTES*/
router.post(
  "/addProduct",
  verifyToken,
  isAdmin,
  upload.array("images", 5),
  createProduct,
);

router.put(
  "/updateProduct/:id",
  verifyToken,
  isAdmin,
  upload.array("images", 5),
  updateProduct,
);

router.delete("/deleteProduct/:id", verifyToken, isAdmin, deleteProduct);

module.exports = router;
