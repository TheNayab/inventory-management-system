import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft, FaQrcode, FaImage } from 'react-icons/fa';
import { createProduct, generateSKU } from '../services/productService';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    category: '',
    price: '',
    cost: '',
    quantity: '',
    minQuantity: '10',
    supplier: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skuLoading, setSkuLoading] = useState(true);

  // Fetch unique SKU on component mount
  useEffect(() => {
    const fetchSKU = async () => {
      try {
        const response = await generateSKU();
        setFormData(prev => ({
          ...prev,
          sku: response.data.sku
        }));
      } catch (error) {
        console.error('Error generating SKU:', error);
        toast.error('Failed to generate SKU');
      } finally {
        setSkuLoading(false);
      }
    };
    fetchSKU();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append image if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      await createProduct(formDataToSend);
      toast.success('Product created successfully!');
      navigate('/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add New Product</h1>
        <button onClick={() => navigate('/products')} className="btn btn-secondary">
          <FaArrowLeft /> Back to Products
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>SKU (Auto-generated)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  name="sku"
                  className="form-control"
                  value={skuLoading ? 'Generating...' : formData.sku}
                  onChange={handleChange}
                  placeholder="Generating unique SKU..."
                  disabled={skuLoading}
                  style={{ 
                    flex: 1,
                    backgroundColor: skuLoading ? '#f5f5f5' : 'white'
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={async () => {
                    setSkuLoading(true);
                    try {
                      const response = await generateSKU();
                      setFormData(prev => ({
                        ...prev,
                        sku: response.data.sku
                      }));
                      toast.success('New SKU generated!');
                    } catch (error) {
                      toast.error('Failed to generate SKU');
                    } finally {
                      setSkuLoading(false);
                    }
                  }}
                  disabled={skuLoading}
                  style={{ padding: '0 15px', whiteSpace: 'nowrap' }}
                >
                  🔄 Regenerate
                </button>
              </div>
              <small style={{ color: 'var(--color-dark-grey)', marginTop: '5px', display: 'block' }}>
                🏷️ Unique SKU auto-generated. Click Regenerate for a new one or edit manually.
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaQrcode style={{ color: 'var(--color-primary)' }} /> Barcode
              </label>
              <input
                type="text"
                name="barcode"
                className="form-control"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="Scan or type barcode here..."
                style={{ borderColor: 'var(--color-primary)', borderWidth: '2px' }}
              />
              <small style={{ color: 'var(--color-dark-grey)', marginTop: '5px', display: 'block' }}>
                📱 Click here and scan with your barcode scanner
              </small>
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaImage style={{ color: 'var(--color-primary)' }} /> Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-control"
              style={{ padding: '8px' }}
            />
            <small style={{ color: 'var(--color-dark-grey)', marginTop: '5px', display: 'block' }}>
              📸 Upload product image (max 5MB, JPG, PNG, GIF, WebP)
            </small>
            {imagePreview && (
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    borderRadius: '8px',
                    border: '2px solid var(--color-light-grey)',
                    objectFit: 'cover'
                  }} 
                />
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price *</label>
              <input
                type="number"
                name="price"
                className="form-control"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Cost</label>
              <input
                type="number"
                name="cost"
                className="form-control"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                className="form-control"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Minimum Quantity</label>
              <input
                type="number"
                name="minQuantity"
                className="form-control"
                min="0"
                value={formData.minQuantity}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Supplier</label>
            <input
              type="text"
              name="supplier"
              className="form-control"
              value={formData.supplier}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <FaSave /> {loading ? 'Saving...' : 'Save Product'}
            </button>
            <button type="button" onClick={() => navigate('/products')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
