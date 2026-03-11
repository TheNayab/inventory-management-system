import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaBoxes, FaShoppingCart, FaHamburger } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <FaHamburger />
        </div>
        <div className="brand-text">
          <h2>Khalid Burger Point</h2>
          <p className="brand-subtitle">Inventory System</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className="nav-item" end>
          <FaTachometerAlt className="nav-icon" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/products" className="nav-item">
          <FaBoxes className="nav-icon" />
          <span>Products</span>
        </NavLink>
        <NavLink to="/sales" className="nav-item">
          <FaShoppingCart className="nav-icon" />
          <span>Sales</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
