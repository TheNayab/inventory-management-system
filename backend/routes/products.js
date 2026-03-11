const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getProducts,
  getProduct,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  generateUniqueSKU,
} = require('../controllers/productController');

router.route('/').get(getProducts).post(upload.single('image'), createProduct);

router.route('/categories/all').get(getCategories);

router.route('/generate/sku').get(generateUniqueSKU);

router.route('/barcode/:barcode').get(getProductByBarcode);

router
  .route('/:id')
  .get(getProduct)
  .put(upload.single('image'), updateProduct)
  .delete(deleteProduct);

module.exports = router;
