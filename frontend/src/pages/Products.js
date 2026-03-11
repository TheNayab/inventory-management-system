import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaBarcode } from 'react-icons/fa';
import { getProducts, deleteProduct } from '../services/productService';
import { formatCurrency } from '../utils/helpers';
import ConfirmModal from '../components/ConfirmModal';
import { BASE_URL } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    lowStock: false,
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.lowStock) params.lowStock = 'true';

      const response = await getProducts(params);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteModal({ isOpen: true, productId: id });
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(deleteModal.productId);
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <Link to="/products/add" className="btn btn-primary">
          <FaPlus /> Add Product
        </Link>
      </div>

      <div className="filter-section">
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Search</label>
            <input
              type="text"
              name="search"
              className="form-control"
              placeholder="Search by name, SKU, or barcode"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <input
                type="checkbox"
                name="lowStock"
                checked={filters.lowStock}
                onChange={handleFilterChange}
                style={{ marginRight: '8px' }}
              />
              Show Low Stock Only
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FaBarcode />
          </div>
          <h3>No products found</h3>
          <p>Start by adding your first product</p>
          <Link to="/products/add" className="btn btn-primary">
            <FaPlus /> Add Product
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    {product.image ? (
                      <img 
                        src={`${BASE_URL}${product.image}`}
                        alt={product.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid var(--color-light-grey)'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--color-light-grey)',
                        borderRadius: '8px',
                        color: 'var(--color-dark-grey)',
                        fontSize: '0.7rem'
                      }}>
                        No Image
                      </div>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.barcode || '-'}</td>
                  <td>{product.category || '-'}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>
                    <span className={`badge ${product.quantity <= product.minQuantity ? 'badge-danger' : 'badge-success'}`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td>
                    <Link to={`/products/edit/${product._id}`} className="btn btn-small btn-secondary" style={{ marginRight: '8px' }}>
                      <FaEdit />
                    </Link>
                    <button onClick={() => handleDelete(product._id)} className="btn btn-small btn-danger">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null })}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Products;
