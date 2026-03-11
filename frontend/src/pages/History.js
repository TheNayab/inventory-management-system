import React, { useState, useEffect } from 'react';
import { FaBox, FaShoppingCart } from 'react-icons/fa';
import { getProducts } from '../services/productService';
import { getSales } from '../services/saleService';
import { formatCurrency, formatDateTime, getStatusColor } from '../utils/helpers';

const History = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    search: '',
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.search) params.search = filters.search;

      let response;
      if (activeTab === 'products') {
        response = await getProducts(params);
      } else {
        response = await getSales(params);
      }

      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderProductsTable = () => (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>{product.category || '-'}</td>
              <td>{formatCurrency(product.price)}</td>
              <td>
                <span className={`badge ${product.quantity <= product.minQuantity ? 'badge-danger' : 'badge-success'}`}>
                  {product.quantity}
                </span>
              </td>
              <td>{formatDateTime(product.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSalesTable = () => (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Items</th>
            <th>Total Amount</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((sale) => (
            <tr key={sale._id}>
              <td>{formatDateTime(sale.createdAt)}</td>
              <td>
                {sale.items.map(item => item.productName).join(', ')}
              </td>
              <td>{formatCurrency(sale.total)}</td>
              <td>
                <span className="badge badge-info">
                  {sale.paymentMethod}
                </span>
              </td>
              <td>
                <span className={`badge badge-${getStatusColor(sale.status)}`}>
                  {sale.status}
                </span>
              </td>
              <td>{sale.notes || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>History</h1>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid var(--color-light-grey)', paddingBottom: '10px' }}>
          <button
            className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('products')}
          >
            <FaBox /> Products
          </button>
          <button
            className={`btn ${activeTab === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('sales')}
          >
            <FaShoppingCart /> Sales
          </button>
        </div>

        <div className="filter-grid" style={{ marginBottom: '20px' }}>
          {activeTab === 'products' && (
            <div className="form-group">
              <label>Search</label>
              <input
                type="text"
                name="search"
                className="form-control"
                placeholder="Search products..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
          )}

          {activeTab === 'sales' && (
            <>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-control"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>
            </>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading history...</div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <h3>No records found</h3>
          </div>
        ) : (
          <>
            {activeTab === 'products' && renderProductsTable()}
            {activeTab === 'sales' && renderSalesTable()}
          </>
        )}
      </div>
    </div>
  );
};

export default History;
