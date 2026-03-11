const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  completeOrder,
  cancelOrder,
} = require('../controllers/orderController');

router.route('/').get(getOrders).post(createOrder);

router.route('/:id').get(getOrder).put(updateOrder);

router.route('/:id/complete').put(completeOrder);

router.route('/:id/cancel').put(cancelOrder);

module.exports = router;
