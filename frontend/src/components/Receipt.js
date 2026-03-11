import React from 'react';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import './Receipt.css';

const Receipt = ({ sale, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  if (!sale) return null;

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-container" onClick={(e) => e.stopPropagation()}>
        {/* Print Button - Only visible on screen */}
        <div className="no-print" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: 0 }}>Receipt Preview</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handlePrint} className="btn btn-primary">
              🖨️ Print Receipt
            </button>
            <button onClick={onClose} className="btn btn-secondary">
              ✕ Close
            </button>
          </div>
        </div>

        {/* Receipt Content - This will be printed */}
        <div className="receipt-paper">
          {/* Header */}
          <div className="receipt-header">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="receipt-logo"
            />
            <h1 className="business-name">KHALID BURGER POINT</h1>
            <p className="business-info">Khachi Fatomand Chock, Jinnah Road</p>
            <p className="business-info">Opposite Street No. 1</p>
            <p className="business-info">Tel: 03107705044</p>
          </div>

          <div className="receipt-divider"></div>

          {/* Order Info */}
          <div className="receipt-info">
            <p><strong>Receipt #:</strong> #{sale.orderId || 'N/A'}</p>
            <p><strong>Date:</strong> {formatDateTime(sale.createdAt)}</p>
            {sale.customerName && <p><strong>Customer:</strong> {sale.customerName}</p>}
            {sale.customerPhone && <p><strong>Phone:</strong> {sale.customerPhone}</p>}
          </div>

          <div className="receipt-divider"></div>

          {/* Items */}
          <table className="receipt-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.productName || item.product?.name || 'N/A'}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-divider"></div>

          {/* Total */}
          <div className="receipt-total">
            <p className="total-line"><strong>TOTAL:</strong> <strong>{formatCurrency(sale.total)}</strong></p>
            <p><strong>Payment:</strong> {sale.paymentMethod}</p>
          </div>

          <div className="receipt-divider"></div>

          {/* Footer */}
          <div className="receipt-footer">
            <p className="thank-you">Thank You!</p>
            <p>Visit us again</p>
          </div>

          {sale.notes && (
            <div className="receipt-notes">
              <p><strong>Notes:</strong> {sale.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Receipt;
