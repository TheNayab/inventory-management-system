import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const barcodeBuffer = useRef('');
  const barcodeTimeout = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field on Add/Edit Product pages
      const activeElement = document.activeElement;
      const isInputField = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'SELECT'
      );

      const isOnProductPage = location.pathname.includes('/products/add') || 
                              location.pathname.includes('/products/edit');
      const isBarcodeInput = activeElement && activeElement.placeholder && 
        activeElement.placeholder.includes('Scan barcode');

      // Block scanning only when on product add/edit pages and typing in non-barcode fields
      if (isOnProductPage && isInputField && !isBarcodeInput) {
        return;
      }

      const isOnSalesPage = location.pathname === '/sales/new';

      // Barcode scanners type very fast and end with Enter
      if (e.key === 'Enter' && barcodeBuffer.current.length > 0) {
        e.preventDefault();
        
        const scannedBarcode = barcodeBuffer.current.trim();
        barcodeBuffer.current = '';
        
        // Only process if we have a valid barcode (at least 1 character)
        if (scannedBarcode.length >= 1) {
          console.log('Barcode scanned globally:', scannedBarcode);
          
          // If not on sales page, navigate there with the barcode
          if (!isOnSalesPage) {
            navigate('/sales/new', { state: { scannedBarcode } });
          } else {
            // If already on sales page, just dispatch the event
            window.dispatchEvent(new CustomEvent('barcodeScanned', { 
              detail: { barcode: scannedBarcode } 
            }));
          }
        }
        
        clearTimeout(barcodeTimeout.current);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Accumulate barcode characters (ignore modifier keys)
        barcodeBuffer.current += e.key;
        
        // Clear buffer after 200ms of no input (barcode scanners are typically faster)
        clearTimeout(barcodeTimeout.current);
        barcodeTimeout.current = setTimeout(() => {
          barcodeBuffer.current = '';
        }, 200);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(barcodeTimeout.current);
    };
  }, [navigate, location]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="page-container">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
