import api from './api';

// Get all orders
export const getOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

// Get single order
export const getOrder = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Create order
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// Update order
export const updateOrder = async (id, orderData) => {
  const response = await api.put(`/orders/${id}`, orderData);
  return response.data;
};

// Complete order
export const completeOrder = async (id) => {
  const response = await api.put(`/orders/${id}/complete`);
  return response.data;
};

// Cancel order
export const cancelOrder = async (id) => {
  const response = await api.put(`/orders/${id}/cancel`);
  return response.data;
};
