import api from './api';

// Get all products
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

// Get single product
export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Get product by barcode
export const getProductByBarcode = async (barcode) => {
  // URL encode the barcode to handle special characters like /, :, etc.
  const encodedBarcode = encodeURIComponent(barcode);
  const response = await api.get(`/products/barcode/${encodedBarcode}`);
  return response.data;
};

// Create product
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// Update product
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Delete product
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Get categories
export const getCategories = async () => {
  const response = await api.get('/products/categories/all');
  return response.data;
};

// Generate unique SKU
export const generateSKU = async () => {
  const response = await api.get('/products/generate/sku');
  return response.data;
};
