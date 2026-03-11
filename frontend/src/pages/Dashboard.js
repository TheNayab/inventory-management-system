import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBoxes,
  FaDollarSign,
  FaShoppingCart,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";
import { getProducts } from "../services/productService";
import { getSalesStats, getPendingSales } from "../services/saleService";
import { formatCurrency } from "../utils/helpers";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
    totalSales: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, salesStatsRes, lowStockRes, pendingRes] = await Promise.all([
        getProducts(),
        getSalesStats(),
        getProducts({ lowStock: "true" }),
        getPendingSales(),
      ]);

      setStats({
        totalProducts: productsRes.count,
        lowStockProducts: lowStockRes.count,
        totalRevenue: salesStatsRes.data.totalRevenue || 0,
        totalSales: salesStatsRes.data.totalSales || 0,
      });

      setLowStockItems(lowStockRes.data.slice(0, 5));
      setPendingOrders(pendingRes.data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <FaBoxes className="stat-icon" />
          <div className="stat-info">
            <h3>Total Products</h3>
            <p>{stats.totalProducts}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaShoppingCart className="stat-icon" />
          <div className="stat-info">
            <h3>Total Sales</h3>
            <p>{stats.totalSales}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaDollarSign className="stat-icon" />
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p>{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaExclamationTriangle
            className="stat-icon"
            style={{ color: "var(--color-danger)" }}
          />
          <div className="stat-info">
            <h3>Low Stock Items</h3>
            <p>{stats.lowStockProducts}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaClock
            className="stat-icon"
            style={{ color: "var(--color-warning)" }}
          />
          <div className="stat-info">
            <h3>Pending Orders</h3>
            <p>{pendingOrders.length}</p>
          </div>
        </div>
      </div>

      {/* Pending Orders Section */}
      {pendingOrders.length > 0 && (
        <div className="card" style={{ marginBottom: '25px' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaClock style={{ color: 'var(--color-warning)' }} />
            Pending Orders
          </div>
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                      #{order.orderId || 'N/A'}
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.customerName || 'N/A'}</td>
                    <td>{order.customerPhone || 'N/A'}</td>
                    <td>{order.items.length} items</td>
                    <td style={{ fontWeight: 'bold' }}>{formatCurrency(order.total)}</td>
                    <td>
                      <Link
                        to={`/sales/edit/${order._id}`}
                        className="btn btn-small btn-primary"
                      >
                        Edit Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {lowStockItems.length > 0 && (
        <div className="card">
          <div className="card-header">Low Stock Alert</div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Current Stock</th>
                  <th>Min Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>
                      <span className="badge badge-danger">
                        {product.quantity}
                      </span>
                    </td>
                    <td>{product.minQuantity}</td>
                    <td>
                      <Link
                        to="/products/edit/"
                        className="btn btn-small btn-primary"
                      >
                        Update Stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="stats-grid" style={{ marginTop: "20px" }}>
        <Link
          to="/products/add"
          className="stat-card"
          style={{ textDecoration: "none", cursor: "pointer" }}
        >
          <div style={{ textAlign: "center", width: "100%" }}>
            <p style={{ fontSize: "1.2rem", color: "var(--color-text)" }}>
              Add New Product
            </p>
          </div>
        </Link>

        <Link
          to="/sales/new"
          className="stat-card"
          style={{ textDecoration: "none", cursor: "pointer" }}
        >
          <div style={{ textAlign: "center", width: "100%" }}>
            <p style={{ fontSize: "1.2rem", color: "var(--color-text)" }}>
              New Sale
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
