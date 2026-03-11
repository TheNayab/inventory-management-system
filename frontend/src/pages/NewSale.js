import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft, FaPlus, FaTrash, FaShoppingCart, FaMinus, FaQrcode } from 'react-icons/fa';
import { createSale, updateSale, getSale } from '../services/saleService';
import { getProductByBarcode, getProducts } from '../services/productService';
import { formatCurrency } from '../utils/helpers';
import { BASE_URL } from '../services/api';
import Receipt from '../components/Receipt';

const NewSale = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [completedSale, setCompletedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const barcodeInputRef = useRef(null);
  const processedBarcodeRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    // Load pending sale if editing
    if (id) {
      loadPendingSale(id);
    }
  }, [id]);

  // Listen for global barcode scans
  useEffect(() => {
    const handleBarcodeScanned = async (event) => {
      const { barcode } = event.detail;
      try {
        const response = await getProductByBarcode(barcode);
        addToCart(response.data);
      } catch (error) {
        toast.error('Product not found with barcode: ' + barcode);
      }
    };

    window.addEventListener('barcodeScanned', handleBarcodeScanned);
    
    return () => {
      window.removeEventListener('barcodeScanned', handleBarcodeScanned);
    };
  }, []);

  // Handle barcode from navigation state (when navigating from other pages)
  useEffect(() => {
    if (location.state?.scannedBarcode) {
      const barcode = location.state.scannedBarcode;
      
      // Prevent double processing of the same barcode
      if (processedBarcodeRef.current === barcode) {
        return;
      }
      
      processedBarcodeRef.current = barcode;
      
      const processNavigationBarcode = async () => {
        try {
          const response = await getProductByBarcode(barcode);
          addToCart(response.data);
        } catch (error) {
          toast.error('Product not found with barcode: ' + barcode);
        }
      };
      
      processNavigationBarcode();
      
      // Clear the state after processing
      setTimeout(() => {
        window.history.replaceState({}, document.title);
        processedBarcodeRef.current = null;
      }, 100);
    }
  }, [location.state?.scannedBarcode]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadPendingSale = async (saleId) => {
    try {
      setLoading(true);
      const response = await getSale(saleId);
      const sale = response.data;

      if (sale.status !== 'pending') {
        toast.error('Only pending orders can be edited');
        navigate('/sales');
        return;
      }

      // Load sale data into form
      setEditingSaleId(saleId);
      setCustomerName(sale.customerName || '');
      setCustomerPhone(sale.customerPhone || '');
      setPaymentMethod(sale.paymentMethod);
      setNotes(sale.notes || '');

      // Load items into cart
      // Note: pending sale inventory is already deducted, so we add back the pending quantity to maxQuantity
      const cartItems = sale.items.map(item => {
        const currentStock = item.product.quantity || 0;
        const pendingQuantity = item.quantity;
        return {
          product: item.product._id || item.product,
          productName: item.productName,
          price: item.price,
          quantity: pendingQuantity,
          maxQuantity: currentStock + pendingQuantity, // Current stock + what's already in this pending order
        };
      });
      setItems(cartItems);

      toast.success('Pending order loaded for editing');
    } catch (error) {
      console.error('Error loading pending sale:', error);
      toast.error('Failed to load pending order');
      navigate('/sales');
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    try {
      const response = await getProductByBarcode(barcodeInput.trim());
      addToCart(response.data);
      setBarcodeInput('');
    } catch (error) {
      toast.error('Product not found with barcode: ' + barcodeInput);
      setBarcodeInput('');
    }
    
    // Keep focus on barcode input for next scan
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      toast.warning('Product is out of stock!');
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product === product._id);
      
      if (existingItem) {
        if (existingItem.quantity < existingItem.maxQuantity) {
          return prevItems.map(item =>
            item.product === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          toast.warning('Cannot add more. Maximum available quantity reached.');
          return prevItems;
        }
      } else {
        return [...prevItems, {
          product: product._id,
          productName: product.name,
          price: product.price,
          quantity: 1,
          maxQuantity: product.quantity,
        }];
      }
    });
  };

  const increaseQuantity = (index) => {
    const newItems = [...items];
    if (newItems[index].quantity < newItems[index].maxQuantity) {
      newItems[index].quantity += 1;
      setItems(newItems);
    } else {
      toast.warning(`Maximum available quantity is ${newItems[index].maxQuantity}`);
    }
  };

  const decreaseQuantity = (index) => {
    const newItems = [...items];
    if (newItems[index].quantity > 1) {
      newItems[index].quantity -= 1;
      setItems(newItems);
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSubmit = async (e, orderStatus) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.warning('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      const saleData = {
        items: items.map(item => ({
          product: item.product,
          quantity: item.quantity,
        })),
        paymentMethod,
        notes,
        status: orderStatus,
        customerName,
        customerPhone,
      };

      let response;
      if (editingSaleId) {
        // Update existing pending sale
        response = await updateSale(editingSaleId, saleData);
        toast.success(orderStatus === 'pending' ? 'Order updated and saved as pending!' : 'Order completed successfully!');
      } else {
        // Create new sale
        response = await createSale(saleData);
        toast.success(orderStatus === 'pending' ? 'Order saved as pending!' : 'Sale completed successfully!');
      }
      
      // Show receipt for completed orders
      if (response && response.data) {
        setCompletedSale(response.data);
        setShowReceipt(true);
      } else {
        navigate('/sales');
      }
    } catch (error) {
      console.error('Error saving sale:', error);
      toast.error(error.response?.data?.error || 'Failed to save sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>{editingSaleId ? 'Edit Pending Order' : 'New Sale'}</h1>
        <button onClick={() => navigate('/sales')} className="btn btn-secondary">
          <FaArrowLeft /> Back
        </button>
      </div>

      {/* Barcode Scanner Input */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #FF8FAB 100%)',
        padding: '20px',
        marginBottom: '25px',
        border: 'none'
      }}>
        <form onSubmit={handleBarcodeSubmit} style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <FaQrcode style={{ fontSize: '2rem', color: 'white' }} />
            <div style={{ flex: 1 }}>
              <input
                ref={barcodeInputRef}
                type="text"
                className="form-control"
                placeholder="Scan barcode here or type and press Enter..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                style={{ 
                  fontSize: '1.1rem',
                  padding: '14px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <small style={{ color: 'white', marginTop: '8px', display: 'block', fontWeight: '500' }}>
                💡 Just scan - no need to click! Scanner works from anywhere in the app.
              </small>
            </div>
          </div>
        </form>
      </div>

      {/* Products Grid */}
      <div className="card">
        <div className="card-header">
          Available Products
        </div>
        
        {productsLoading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No products found</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '15px',
            maxHeight: '500px',
            overflowY: 'auto',
            padding: '10px'
          }}>
            {products.map((product) => (
              <div
                key={product._id}
                style={{
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: product.quantity <= 0 ? 'var(--color-light-grey)' : 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'var(--transition)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (product.quantity > 0) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div>
                  {product.image && (
                    <img 
                      src={`${BASE_URL}${product.image}`}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        border: '1px solid var(--color-light-grey)'
                      }}
                    />
                  )}
                  {!product.image && (
                    <div style={{
                      width: '100%',
                      height: '150px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'var(--color-light-grey)',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      color: 'var(--color-dark-grey)',
                      fontSize: '0.9rem'
                    }}>
                      No Image
                    </div>
                  )}
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '700' }}>{product.name}</h4>
                  <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--color-dark-grey)' }}>
                    SKU: {product.sku}
                  </p>
                  <p style={{ margin: '8px 0', fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                    {formatCurrency(product.price)}
                  </p>
                  <p style={{ margin: '0', fontSize: '0.85rem' }}>
                    Stock: <span className={`badge ${product.quantity <= product.minQuantity ? 'badge-warning' : 'badge-success'}`}>
                      {product.quantity}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="btn btn-primary"
                  disabled={product.quantity <= 0}
                  style={{ marginTop: '12px', width: '100%' }}
                >
                  <FaPlus /> Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shopping Cart Section */}
      <div className="card" style={{ 
        background: 'white',
        border: '2px solid var(--color-primary)',
        marginTop: '25px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaShoppingCart style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>Shopping Cart ({getCartItemCount()} items)</span>
          </div>
          {items.length > 0 && (
            <span style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--color-primary)' }}>
              Total: {formatCurrency(calculateTotal())}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-dark-grey)' }}>
            <FaShoppingCart style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.3 }} />
            <p>Your cart is empty. Add products to start a sale.</p>
          </div>
        ) : (
          <>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <button
                            onClick={() => decreaseQuantity(index)}
                            className="btn btn-small btn-secondary"
                            style={{ padding: '5px 10px' }}
                          >
                            <FaMinus />
                          </button>
                          <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 'bold' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(index)}
                            className="btn btn-small btn-secondary"
                            style={{ padding: '5px 10px' }}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>{formatCurrency(item.price * item.quantity)}</td>
                      <td>
                        <button onClick={() => removeItem(index)} className="btn btn-small btn-danger">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form onSubmit={(e) => e.preventDefault()} style={{ borderTop: '2px solid var(--color-light-grey)', paddingTop: '20px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name (optional)"
                  />
                </div>

                <div className="form-group">
                  <label>Customer Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone number (optional)"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    className="form-control"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                    <option value="other">Other</option>
                  </select>
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
                <button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, 'pending')} 
                  className="btn btn-secondary" 
                  disabled={loading} 
                  style={{ flex: 1, padding: '15px', fontSize: '1.1rem' }}
                >
                  <FaSave /> {loading ? 'Processing...' : 'Save as Pending'}
                </button>
                <button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, 'completed')} 
                  className="btn btn-success" 
                  disabled={loading} 
                  style={{ flex: 1, padding: '15px', fontSize: '1.1rem' }}
                >
                  <FaSave /> {loading ? 'Processing...' : `Complete Order - ${formatCurrency(calculateTotal())}`}
                </button>
                <button type="button" onClick={() => setItems([])} className="btn btn-secondary">
                  Clear Cart
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceipt && completedSale && (
        <Receipt 
          sale={completedSale} 
          onClose={() => {
            setShowReceipt(false);
            setCompletedSale(null);
            navigate('/sales');
          }} 
        />
      )}
    </div>
  );
};

export default NewSale;
