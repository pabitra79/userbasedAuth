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

      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data,
      });
    } catch (err) {
      console.error("Error in index:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Create new product
  async createProduct(req, res) {
    try {
      const { name, price, size, category, color, brand } = req.body;
      const image = req.file ? req.file.path.replace(/\\/g, "/") : null;

      if (!name || !price || !size || !category || !color || !brand || !image) {
        if (req.file && req.file.path) fs.unlinkSync(req.file.path); // clean file
        return res.status(400).json({
          success: false,
          message: "All fields are required including image",
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

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: savedProduct,
      });
    } catch (err) {
      console.error("Error creating product:", err);
      if (req.file && req.file.path) fs.unlinkSync(req.file.path);
      return res
        .status(500)
        .json({ success: false, message: "Failed to create product" });
    }
  }

  // Get single product by ID
  async getProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      return res.status(200).json({ success: true, data: product });
    } catch (err) {
      console.error("Error in getProduct:", err);
      return res.status(500).json({ success: false, message: "Server error" });
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
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      const updateData = { name, price, size, category, color, brand };
      if (req.file) {
        if (currentProduct.image && fs.existsSync(currentProduct.image)) {
          fs.unlinkSync(currentProduct.image);
        }
        updateData.image = req.file.path.replace(/\\/g, "/");
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (err) {
      console.error("Error in updateProduct:", err);
      if (req.file && req.file.path) fs.unlinkSync(req.file.path);
      return res
        .status(500)
        .json({ success: false, message: "Failed to update product" });
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      if (product.image && fs.existsSync(product.image)) {
        fs.unlinkSync(product.image);
      }

      await Product.findByIdAndDelete(req.params.id);

      return res
        .status(200)
        .json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
      console.error("Error in deleteProduct:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete product" });
    }
  }
}

module.exports = new ProductController();
