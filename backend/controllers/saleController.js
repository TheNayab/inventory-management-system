const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Helper function to generate next sequential order ID
const generateOrderId = async () => {
  try {
    // Find the latest order with numeric orderId
    const latestSale = await Sale.findOne({ orderId: { $type: 'number' } })
      .sort({ orderId: -1 })
      .select('orderId');
    
    // If no numeric orders exist, start with 1, otherwise increment the latest
    const nextId = latestSale && typeof latestSale.orderId === 'number' 
      ? latestSale.orderId + 1 
      : 1;
    
    return nextId;
  } catch (error) {
    console.error('Error generating order ID:', error);
    return 1; // Fallback to 1 if there's an error
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Public
exports.getSales = async (req, res, next) => {
  try {
    const { startDate, endDate, status, paymentMethod } = req.query;
    let query = {};

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Payment method filter
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    const sales = await Sale.find(query)
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Public
exports.getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('items.product');

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found',
      });
    }

    res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new sale
// @route   POST /api/sales
// @access  Public
exports.createSale = async (req, res, next) => {
  try {
    const { items, paymentMethod, notes, status, customerName, customerPhone } = req.body;

    // Validate and update inventory
    let total = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product with ID ${item.product} not found`,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient quantity for product: ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
        });
      }

      const subtotal = product.price * item.quantity;
      total += subtotal;

      saleItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });

      // Update product quantity
      product.quantity -= item.quantity;
      await product.save();
    }

    // Generate next sequential order ID
    const orderId = await generateOrderId();

    const sale = await Sale.create({
      orderId,
      items: saleItems,
      total,
      paymentMethod,
      notes,
      status: status || 'completed',
      customerName: customerName || '',
      customerPhone: customerPhone || '',
    });

    res.status(201).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Public
exports.updateSale = async (req, res, next) => {
  try {
    const { items, paymentMethod, notes, status, customerName, customerPhone } = req.body;
    const saleId = req.params.id;

    // Find the existing sale
    const existingSale = await Sale.findById(saleId);

    if (!existingSale) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found',
      });
    }

    // If sale was pending and is being updated, restore previous inventory
    if (existingSale.status === 'pending') {
      for (const item of existingSale.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }
    }

    // Validate and update inventory for new items
    let total = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product with ID ${item.product} not found`,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient quantity for product: ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
        });
      }

      const subtotal = product.price * item.quantity;
      total += subtotal;

      saleItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });

      // Update product quantity
      product.quantity -= item.quantity;
      await product.save();
    }

    // Update the sale
    const updatedSale = await Sale.findByIdAndUpdate(
      saleId,
      {
        items: saleItems,
        total,
        paymentMethod,
        notes,
        status: status || 'completed',
        customerName: customerName || '',
        customerPhone: customerPhone || '',
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedSale,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales statistics
// @route   GET /api/sales/stats/summary
// @access  Public
exports.getSalesStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let matchStage = {};

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.createdAt.$lte = new Date(endDate);
      }
    }

    const stats = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageSale: { $avg: '$total' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || { totalSales: 0, totalRevenue: 0, averageSale: 0 },
    });
  } catch (error) {
    next(error);
  }
};
