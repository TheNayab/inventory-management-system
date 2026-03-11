import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft, FaQrcode, FaImage } from 'react-icons/fa';
import { getProduct, updateProduct } from '../services/productService';
import { BASE_URL } from '../services/api';

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    category: '',
    price: '',
    cost: '',
    quantity: '',
    minQuantity: '',
    supplier: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await getProduct(id);
      setFormData(response.data);
      if (response.data.image) {
        setCurrentImage(response.data.image);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] && key !== 'image' && key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append new image if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      await updateProduct(id, formDataToSend);
      toast.success('Product updated successfully!');
      navigate('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.error || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Edit Product</h1>
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
              <label>SKU</label>
              <input
                type="text"
                name="sku"
                className="form-control"
                value={formData.sku}
                readOnly
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <small style={{ color: 'var(--color-dark-grey)', marginTop: '5px', display: 'block' }}>
                🏷️ SKU cannot be changed after creation
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
                value={formData.category || ''}
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
              value={formData.description || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaImage style={{ color: 'var(--color-primary)' }} /> Product Image
            </label>
            {currentImage && !imagePreview && (
              <div style={{ marginBottom: '15px' }}>
                <p style={{ color: 'var(--color-dark-grey)', fontSize: '0.9rem', marginBottom: '8px' }}>Current Image:</p>
                <img 
                  src={`${BASE_URL}${currentImage}`}
                  alt="Current product" 
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
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-control"
              style={{ padding: '8px' }}
            />
            <small style={{ color: 'var(--color-dark-grey)', marginTop: '5px', display: 'block' }}>
              📸 Upload new image to replace current (max 5MB, JPG, PNG, GIF, WebP)
            </small>
            {imagePreview && (
              <div style={{ marginTop: '15px' }}>
                <p style={{ color: 'var(--color-dark-grey)', fontSize: '0.9rem', marginBottom: '8px' }}>New Image Preview:</p>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    borderRadius: '8px',
                    border: '2px solid var(--color-primary)',
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
                value={formData.cost || ''}
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
              value={formData.supplier || ''}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <FaSave /> {saving ? 'Saving...' : 'Update Product'}
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

export default EditProduct;
