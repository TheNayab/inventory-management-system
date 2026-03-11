import api from './api';

// Get all sales
export const getSales = async (params = {}) => {
  const response = await api.get('/sales', { params });
  return response.data;
};

// Get single sale
export const getSale = async (id) => {
  const response = await api.get(`/sales/${id}`);
  return response.data;
};

// Create sale
export const createSale = async (saleData) => {
  const response = await api.post('/sales', saleData);
  return response.data;
};

// Update sale
export const updateSale = async (id, saleData) => {
  const response = await api.put(`/sales/${id}`, saleData);
  return response.data;
};

// Get sales statistics
export const getSalesStats = async (params = {}) => {
  const response = await api.get('/sales/stats/summary', { params });
  return response.data;
};

// Get pending sales
export const getPendingSales = async () => {
  const response = await api.get('/sales', { params: { status: 'pending' } });
  return response.data;
};
