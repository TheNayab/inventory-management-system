import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { getOrders, completeOrder, cancelOrder } from '../services/orderService';
import { formatCurrency, formatDateTime, getStatusColor } from '../utils/helpers';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    supplier: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.supplier) params.supplier = filters.supplier;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await getOrders(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const handleCompleteOrder = async (id) => {
    if (window.confirm('Complete this order? Inventory will be updated.')) {
      try {
        await completeOrder(id);
        alert('Order completed successfully!');
        fetchOrders();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to complete order');
      }
    }
  };

  const handleCancelOrder = async (id) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder(id);
        alert('Order cancelled successfully!');
        fetchOrders();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to cancel order');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Purchase Orders</h1>
        <Link to="/orders/new" className="btn btn-primary">
          <FaPlus /> New Order
        </Link>
      </div>

      <div className="filter-section">
        <div className="filter-grid">
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              className="form-control"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label>Supplier</label>
            <input
              type="text"
              name="supplier"
              className="form-control"
              placeholder="Search by supplier"
              value={filters.supplier}
              onChange={handleFilterChange}
            />
          </div>

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
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders found</h3>
          <p>Start by creating a new purchase order</p>
          <Link to="/orders/new" className="btn btn-primary">
            <FaPlus /> New Order
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td><strong>{order.orderNumber}</strong></td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td>{order.supplier || '-'}</td>
                  <td>{order.items.length} items</td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>
                    <span className={`badge badge-${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleCompleteOrder(order._id)}
                          className="btn btn-small btn-success"
                          style={{ marginRight: '8px' }}
                        >
                          <FaCheck /> Complete
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="btn btn-small btn-danger"
                        >
                          <FaTimes /> Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
