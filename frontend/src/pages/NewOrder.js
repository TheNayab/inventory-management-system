import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaPlus, FaTrash, FaBarcode } from 'react-icons/fa';
import BarcodeScanner from '../components/BarcodeScanner';
import { createOrder } from '../services/orderService';
import { getProductByBarcode, getProducts } from '../services/productService';
import { formatCurrency } from '../utils/helpers';

const NewOrder = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleBarcodeDetected = async (barcode) => {
    try {
      const response = await getProductByBarcode(barcode);
      addItem(response.data);
    } catch (error) {
      alert('Product not found with barcode: ' + barcode);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const response = await getProducts({ search: query });
        setSearchResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const addItem = (product) => {
    const existingItem = items.find(item => item.product === product._id);
    
    if (existingItem) {
      setItems(items.map(item =>
        item.product === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, {
        product: product._id,
        productName: product.name,
        price: product.cost || product.price,
        quantity: 1,
      }]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        })),
        supplier,
        notes,
      };

      await createOrder(orderData);
      alert('Order created successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>New Purchase Order</h1>
        <button onClick={() => navigate('/orders')} className="btn btn-secondary">
          <FaArrowLeft /> Back to Orders
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          Add Items
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search products by name, SKU, or barcode..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-light-grey)',
                borderRadius: '6px',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 100,
                marginTop: '5px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                {searchResults.map(product => (
                  <div
                    key={product._id}
                    onClick={() => addItem(product)}
                    style={{
                      padding: '10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--color-light-grey)',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-offwhite)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <div><strong>{product.name}</strong></div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-dark-grey)' }}>
                      SKU: {product.sku} | Cost: {formatCurrency(product.cost || product.price)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={() => setShowScanner(true)} className="btn btn-primary">
            <FaBarcode /> Scan Barcode
          </button>
        </div>

        {items.length > 0 && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.productName}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: '120px' }}
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: '100px' }}
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      />
                    </td>
                    <td>{formatCurrency(item.price * item.quantity)}</td>
                    <td>
                      <button onClick={() => removeItem(index)} className="btn btn-small btn-danger">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                  <td style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{formatCurrency(calculateTotal())}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="form-row">
            <div className="form-group">
              <label>Supplier</label>
              <input
                type="text"
                className="form-control"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <input
                type="text"
                className="form-control"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading || items.length === 0}>
              <FaSave /> {loading ? 'Creating...' : 'Create Order'}
            </button>
            <button type="button" onClick={() => navigate('/orders')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </form>

      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default NewOrder;
