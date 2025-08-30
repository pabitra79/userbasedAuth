const express = require("express");
const ProductController = require("../controller/usercontroller");
const productimage = require("../helper/multer");
const { AuthCheck, isAdmin } = require("../middleware/authcheck");

const router = express.Router();

// Web Routes
router.get("/", AuthCheck, ProductController.index);
router.get("/add", AuthCheck, isAdmin, ProductController.showAddProductForm);
router.post(
  "/",
  AuthCheck,
  isAdmin,
  productimage.single("image"),
  ProductController.createProduct
);
router.get("/edit/:id", AuthCheck, isAdmin, ProductController.getProduct);
router.post(
  "/edit/:id",
  AuthCheck,
  isAdmin,
  productimage.single("image"),
  ProductController.updateProduct
);
router.delete("/:id", AuthCheck, isAdmin, ProductController.deleteProduct);

module.exports = router;
