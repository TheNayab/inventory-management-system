import React, { useEffect, useRef } from 'react';
import { initBarcodeScanner, stopBarcodeScanner } from '../utils/barcodeScanner';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onDetected, onClose }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      initBarcodeScanner((result) => {
        onDetected(result.codeResult.code);
        stopBarcodeScanner();
        onClose();
      }, videoRef.current);
    }

    return () => {
      stopBarcodeScanner();
    };
  }, [onDetected, onClose]);

  return (
    <div className="scanner-overlay">
      <div className="scanner-container">
        <div className="scanner-header">
          <h3>Scan Barcode</h3>
          <button className="btn-close" onClick={() => {
            stopBarcodeScanner();
            onClose();
          }}>×</button>
        </div>
        <div ref={videoRef} className="scanner-video"></div>
        <p className="scanner-instruction">Position the barcode within the frame</p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
