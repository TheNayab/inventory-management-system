const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0,
  },
  cost: {
    type: Number,
    default: 0,
    min: 0,
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a quantity'],
    min: 0,
    default: 0,
  },
  minQuantity: {
    type: Number,
    default: 10,
    min: 0,
  },
  supplier: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt on save
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
