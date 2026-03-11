import React, { useState } from 'react';
import { FaTimes, FaPrint } from 'react-icons/fa';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import './ConfirmModal.css';
import Receipt from './Receipt';

const SaleDetailModal = ({ isOpen, onClose, sale }) => {
  const [showReceipt, setShowReceipt] = useState(false);
  
  if (!isOpen || !sale) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '700px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h3>Sale Details</h3>
          <button onClick={onClose} className="btn btn-small btn-secondary" style={{ padding: '5px 10px' }}>
            <FaTimes />
          </button>
        </div>
        
        <div 
          className="modal-body" 
          style={{ 
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 140px)',
            flex: 1
          }}
        >
          {/* Sale Information */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <strong style={{ color: 'var(--color-dark-grey)' }}>Order ID:</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  #{sale.orderId || 'N/A'}
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-dark-grey)' }}>Date & Time:</strong>
                <p style={{ margin: '5px 0 0 0' }}>{formatDateTime(sale.createdAt)}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-dark-grey)' }}>Customer Name:</strong>
                <p style={{ margin: '5px 0 0 0' }}>{sale.customerName || 'N/A'}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-dark-grey)' }}>Customer Phone:</strong>
                <p style={{ margin: '5px 0 0 0' }}>{sale.customerPhone || 'N/A'}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-dark-grey)' }}>Payment Method:</strong>
                <p style={{ margin: '5px 0 0 0' }}>
                  <span className="badge badge-info">{sale.paymentMethod}</span>
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-dark-grey)' }}>Status:</strong>
                <p style={{ margin: '5px 0 0 0' }}>
                  <span className="badge badge-success">{sale.status}</span>
                </p>
              </div>
            </div>
            
            {sale.notes && (
              <div>
                <strong style={{ color: 'var(--color-dark-grey)' }}>Notes:</strong>
                <p style={{ margin: '5px 0 0 0', padding: '10px', backgroundColor: 'var(--color-offwhite)', borderRadius: '4px' }}>
                  {sale.notes}
                </p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div>
            <strong style={{ color: 'var(--color-dark-grey)', marginBottom: '10px', display: 'block' }}>Items:</strong>
            <div style={{ border: '1px solid var(--color-light-grey)', borderRadius: '6px', overflow: 'auto' }}>
              <table className="table" style={{ marginBottom: 0 }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-offwhite)', zIndex: 1 }}>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product?.name || 'N/A'}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td style={{ fontWeight: 'bold' }}>{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', borderTop: '2px solid var(--color-light-grey)' }}>
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      Total:
                    </td>
                    <td style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                      {formatCurrency(sale.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ flexShrink: 0 }}>
          <button 
            onClick={() => setShowReceipt(true)} 
            className="btn btn-primary"
            style={{ marginRight: '10px' }}
          >
            <FaPrint /> Print Receipt
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <Receipt 
          sale={sale} 
          onClose={() => setShowReceipt(false)} 
        />
      )}
    </div>
  );
};

export default SaleDetailModal;
