const express = require("express");
const ProductController = require("../controller/usercontroller");
const productimage = require("../helper/multer");

const { AuthCheck, isAdmin } = require("../middleware/authcheck");

const router = express.Router();

// Get all products
router.get("/", AuthCheck, ProductController.index);

// Get single product by ID (for editing)
router.get("/edit/product/:id", AuthCheck, ProductController.getProduct);

// Create new product
router.post(
  "/create-product",
  productimage.single("image"),
  AuthCheck,
  isAdmin,
  ProductController.createProduct
);

// Update product (using POST since HTML forms don't support PUT)
router.post(
  "/update/product/:id",
  productimage.single("image"),
  AuthCheck,
  isAdmin,
  ProductController.updateProduct
);

// Delete product
router.delete(
  "/delete/product/:id",
  AuthCheck,
  isAdmin,
  ProductController.deleteProduct
);

module.exports = router;
