const Product = require("../model/userschema");
const fs = require("fs");

class ProductController {
  // Get all products with filters
  async index(req, res) {
    try {
      let query = {};
      const { size, category, color, brand } = req.query;

      if (size) query.size = { $in: Array.isArray(size) ? size : [size] };
      if (category)
        query.category = {
          $in: Array.isArray(category) ? category : [category],
        };
      if (color) query.color = { $in: Array.isArray(color) ? color : [color] };
      if (brand) query.brand = { $in: Array.isArray(brand) ? brand : [brand] };

      const data = await Product.find(query);

      // Check if it's API request
      if (req.originalUrl.includes("/api/")) {
        return res.status(200).json({
          success: true,
          message: "Products fetched successfully",
          data,
        });
      }

      // For web requests, render the view
      return res.render("index", {
        title: "Products",
        products: data,
        user: req.user,
      });
    } catch (err) {
      console.error("Error in index:", err);
      if (req.originalUrl.includes("/api/")) {
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }
      return res.render("error", {
        title: "Error",
        message: "Server error",
      });
    }
  }

  // Show add product form
  async showAddProductForm(req, res) {
    res.render("products/add", {
      title: "Add Product",
      user: req.user,
      error: null,
    });
  }

  // Create new product
  async createProduct(req, res) {
    try {
      const { name, price, size, category, color, brand } = req.body;
      const image = req.file ? req.file.path.replace(/\\/g, "/") : null;

      if (!name || !price || !size || !category || !color || !brand || !image) {
        if (req.file && req.file.path) fs.unlinkSync(req.file.path);

        if (req.originalUrl.includes("/api/")) {
          return res.status(400).json({
            success: false,
            message: "All fields are required including image",
          });
        }

        return res.render("products/add", {
          title: "Add Product",
          user: req.user,
          error: "All fields are required including image",
        });
      }

      const newProduct = new Product({
        name,
        price,
        size,
        category,
        color,
        brand,
        image,
      });
      const savedProduct = await newProduct.save();

      if (req.originalUrl.includes("/api/")) {
        return res.status(201).json({
          success: true,
          message: "Product created successfully",
          data: savedProduct,
        });
      }

      res.redirect("/products");
    } catch (err) {
      console.error("Error creating product:", err);
      if (req.file && req.file.path) fs.unlinkSync(req.file.path);

      if (req.originalUrl.includes("/api/")) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to create product" });
      }

      return res.render("products/add", {
        title: "Add Product",
        user: req.user,
        error: "Failed to create product",
      });
    }
  }

  // Get single product by ID
  async getProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        if (req.originalUrl.includes("/api/")) {
          return res
            .status(404)
            .json({ success: false, message: "Product not found" });
        }
        return res.render("error", {
          title: "Error",
          message: "Product not found",
        });
      }

      if (req.originalUrl.includes("/api/")) {
        return res.status(200).json({ success: true, data: product });
      }

      // For web requests, render edit form
      return res.render("products/edit", {
        title: "Edit Product",
        product: product,
        user: req.user,
        error: null,
      });
    } catch (err) {
      console.error("Error in getProduct:", err);
      if (req.originalUrl.includes("/api/")) {
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }
      return res.render("error", {
        title: "Error",
        message: "Server error",
      });
    }
  }

  // Update product
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, price, size, category, color, brand } = req.body;

      const currentProduct = await Product.findById(id);
      if (!currentProduct) {
        if (req.file && req.file.path) fs.unlinkSync(req.file.path);

        if (req.originalUrl.includes("/api/")) {
          return res
            .status(404)
            .json({ success: false, message: "Product not found" });
        }
        return res.render("error", {
          title: "Error",
          message: "Product not found",
        });
      }

      const updateData = { name, price, size, category, color, brand };
      if (req.file) {
        // Only update image if new file uploaded
        if (currentProduct.image && fs.existsSync(currentProduct.image)) {
          fs.unlinkSync(currentProduct.image);
        }
        updateData.image = req.file.path.replace(/\\/g, "/");
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (req.originalUrl.includes("/api/")) {
        return res.status(200).json({
          success: true,
          message: "Product updated successfully",
          data: updatedProduct,
        });
      }

      res.redirect("/products");
    } catch (err) {
      console.error("Error in updateProduct:", err);
      if (req.file && req.file.path) fs.unlinkSync(req.file.path);

      if (req.originalUrl.includes("/api/")) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to update product" });
      }

      const product = await Product.findById(req.params.id);
      return res.render("products/edit", {
        title: "Edit Product",
        product: product,
        user: req.user,
        error: "Failed to update product",
      });
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    try {
      const productId = req.params.id;

      // Validate ObjectId format
      if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        // console.log("Invalid product ID format:", productId);
        if (req.originalUrl.includes("/api/")) {
          return res.status(400).json({
            success: false,
            message: "Invalid product ID format",
          });
        }
        return res.redirect("/products");
      }

      const product = await Product.findById(productId);

      if (!product) {
        console.log("Product not found:", productId);
        if (req.originalUrl.includes("/api/")) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }
        return res.redirect("/products");
      }

      // Delete image file if it exists
      if (product.image) {
        const imagePath = product.image;
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            // console.log("Image file deleted:", imagePath);
          }
        } catch (fileErr) {
          console.error("Error deleting image file:", fileErr);
          // Continue with database deletion even if file deletion fails
        }
      }

      // Delete from database
      const deletedProduct = await Product.findByIdAndDelete(productId);

      if (!deletedProduct) {
        console.log("Failed to delete product from database:", productId);
        if (req.originalUrl.includes("/api/")) {
          return res.status(500).json({
            success: false,
            message: "Failed to delete product from database",
          });
        }
        return res.redirect("/products");
      }

      console.log("Product deleted successfully:", productId);

      if (req.originalUrl.includes("/api/")) {
        return res.status(200).json({
          success: true,
          message: "Product deleted successfully",
        });
      }

      res.redirect("/products");
    } catch (err) {
      console.error("Error in deleteProduct:", err);

      if (req.originalUrl.includes("/api/")) {
        return res.status(500).json({
          success: false,
          message: "Failed to delete product",
          error: err.message,
        });
      }

      res.redirect("/products");
    }
  }
}

module.exports = new ProductController();
