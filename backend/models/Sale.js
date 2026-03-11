const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
});

const SaleSchema = new mongoose.Schema({
  orderId: {
    type: Number,
    required: true,
    unique: true,
  },
  items: [SaleItemSchema],
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  customerName: {
    type: String,
    trim: true,
    default: '',
  },
  customerPhone: {
    type: String,
    trim: true,
    default: '',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'other'],
    default: 'cash',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'refunded', 'partial_refund'],
    default: 'completed',
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Sale', SaleSchema);
