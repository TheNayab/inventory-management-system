import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaEye, FaEdit, FaPrint } from "react-icons/fa";
import { getSales } from "../services/saleService";
import {
  formatCurrency,
  formatDateTime,
  getStatusColor,
} from "../utils/helpers";
import SaleDetailModal from "../components/SaleDetailModal";
import Receipt from "../components/Receipt";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptSale, setReceiptSale] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    paymentMethod: "",
  });

  useEffect(() => {
    fetchSales();
  }, [filters]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;

      const response = await getSales(params);
      setSales(response.data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div>
      <div className="page-header">
        <h1>Sales</h1>
        <Link to="/sales/new" className="btn btn-primary ">
          <FaPlus /> New Sale
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Sales</h3>
            <p>{sales.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p>{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-grid">
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
              <option value="completed">Completed</option>
              <option value="refunded">Refunded</option>
              <option value="partial_refund">Partial Refund</option>
            </select>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              name="paymentMethod"
              className="form-control"
              value={filters.paymentMethod}
              onChange={handleFilterChange}
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading sales...</div>
      ) : sales.length === 0 ? (
        <div className="empty-state">
          <h3>No sales found</h3>
          <p>Start by making your first sale</p>
          <Link to="/sales/new" className="btn btn-primary">
            <FaPlus /> New Sale
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id}>
                  <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    #{sale.orderId || 'N/A'}
                  </td>
                  <td>{formatDateTime(sale.createdAt)}</td>
                  <td>{sale.customerName || 'N/A'}</td>
                  <td>{sale.customerPhone || 'N/A'}</td>
                  <td>{sale.items.length} items</td>
                  <td>{formatCurrency(sale.total)}</td>
                  <td>
                    <span className="badge badge-info">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge badge-${getStatusColor(sale.status)}`}
                    >
                      {sale.status}
                    </span>
                  </td>
                  <td>
                    {sale.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Link
                          to={`/sales/edit/${sale._id}`}
                          className="btn btn-small btn-primary"
                        >
                          <FaEdit /> Edit
                        </Link>
                        <button
                          onClick={() => handleViewSale(sale)}
                          className="btn btn-small btn-secondary"
                        >
                          <FaEye /> View
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleViewSale(sale)}
                          className="btn btn-small btn-secondary"
                        >
                          <FaEye /> View
                        </button>
                        <button
                          onClick={() => {
                            setReceiptSale(sale);
                            setShowReceipt(true);
                          }}
                          className="btn btn-small btn-primary"
                        >
                          <FaPrint /> Print
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SaleDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        sale={selectedSale}
      />

      {/* Receipt Modal */}
      {showReceipt && receiptSale && (
        <Receipt 
          sale={receiptSale} 
          onClose={() => {
            setShowReceipt(false);
            setReceiptSale(null);
          }} 
        />
      )}
    </div>
  );
};

export default Sales;
