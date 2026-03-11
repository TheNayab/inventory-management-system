const Product = require('../models/Product');

// Helper function to generate unique SKU
const generateSKU = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `SKU${timestamp}${random}`;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, lowStock } = req.query;
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Low stock filter
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$minQuantity'] };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate unique SKU
// @route   GET /api/products/generate/sku
// @access  Public
exports.generateUniqueSKU = async (req, res, next) => {
  try {
    let sku;
    let isUnique = false;
    // Ensure SKU is unique
    while (!isUnique) {
      sku = generateSKU();
      const existingProduct = await Product.findOne({ sku });
      if (!existingProduct) {
        isUnique = true;
      }
    }

    res.status(200).json({
      success: true,
      data: { sku },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by barcode
// @route   GET /api/products/barcode/:barcode
// @access  Public
exports.getProductByBarcode = async (req, res, next) => {
  try {
    // Decode the barcode parameter to handle special characters
    const barcode = decodeURIComponent(req.params.barcode);
    const product = await Product.findOne({ barcode: barcode });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Public
exports.createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    
    // Remove image field from body if it exists (handled separately via req.file)
    delete productData.image;
    
    // Generate SKU if not provided or check uniqueness if provided
    if (!productData.sku || productData.sku.trim() === '') {
      let sku;
      let isUnique = false;
      // Ensure SKU is unique
      while (!isUnique) {
        sku = generateSKU();
        const existingProduct = await Product.findOne({ sku });
        if (!existingProduct) {
          isUnique = true;
        }
      }
      productData.sku = sku;
    } else {
      // Check if the provided SKU is unique
      const existingProduct = await Product.findOne({ sku: productData.sku });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          error: 'SKU already exists. Please use a unique SKU or leave it empty for auto-generation.',
        });
      }
    }
    
    // Add image path if file was uploaded
    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Public
exports.updateProduct = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    
    // Remove image field from body if it exists (handled separately via req.file)
    delete updateData.image;
    
    // Add image path if new file was uploaded
    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;
      
      // Optional: Delete old image file
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct && oldProduct.image) {
        const fs = require('fs');
        const path = require('path');
        const oldImagePath = path.join(__dirname, '..', oldProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories/all
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');

    res.status(200).json({
      success: true,
      data: categories.filter(cat => cat), // Remove empty values
    });
  } catch (error) {
    next(error);
  }
};
