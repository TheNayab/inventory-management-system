const express = require('express');
const router = express.Router();
const {
  getSales,
  getSale,
  createSale,
  updateSale,
  getSalesStats,
} = require('../controllers/saleController');

router.route('/').get(getSales).post(createSale);

router.route('/stats/summary').get(getSalesStats);

router.route('/:id').get(getSale).put(updateSale);

module.exports = router;
