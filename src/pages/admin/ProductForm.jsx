import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ProductForm = () => {
  const { id } = useParams(); // For edit mode, id will be product ID
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Product state
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    countInStock: '',
    image: '',
    brand: '',
    featured: false,
    numReviews: 0,
    rating: 0
  });

  // Check auth status
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Just log error, not critical for form function
      }
    };

    fetchCategories();
  }, []);

  // If editing, fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return; // Skip if not in edit mode
      
      try {
        setProductLoading(true);
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        
        // Format the data for the form
        const productData = res.data;
        setProduct({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price || '',
          category: productData.category || '',
          countInStock: productData.countInStock || '',
          image: productData.image || '',
          brand: productData.brand || '',
          featured: productData.featured || false,
          numReviews: productData.numReviews || 0,
          rating: productData.rating || 0
        });
        
        // Set image preview if available
        if (productData.image) {
          setImagePreview(`http://localhost:5000${productData.image}`);
        }
        
        setProductLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product data. Please try again.');
        setProductLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Ensure token is set
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Format data for API
      const formData = new FormData();
      
      // Add all product fields to formData
      Object.keys(product).forEach(key => {
        formData.append(key, product[key]);
      });
      
      // Add image file if it exists
      if (imageFile) {
        formData.append('productImage', imageFile);
      }
      
      let response;
      
      if (id) {
        // Update existing product
        response = await axios.put(`http://localhost:5000/api/products/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new product
        response = await axios.post('http://localhost:5000/api/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      setSuccess(true);
      setLoading(false);
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
      
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Failed to save product. Please try again.');
      setLoading(false);
    }
  };

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {id ? 'Edit Product' : 'Add New Product'}
          </h1>
          <button
            onClick={() => navigate('/admin/products')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Back to Products
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Success alert */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>Product {id ? 'updated' : 'created'} successfully!</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                {/* Product Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock */}
                <div>
                  <label htmlFor="countInStock" className="block text-sm font-medium text-gray-700">
                    In Stock *
                  </label>
                  <input
                    type="number"
                    id="countInStock"
                    name="countInStock"
                    value={product.countInStock}
                    onChange={handleChange}
                    min="0"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={product.brand}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={product.featured}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                    Featured Product
                  </label>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Product Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Image
                  </label>
                  <div className="mt-1 flex items-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="h-32 w-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                          }}
                          className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-32 w-32 bg-gray-100 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="relative bg-blue-600 py-2 px-3 rounded-md shadow-sm cursor-pointer hover:bg-blue-700">
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                        <span className="text-white text-sm">Choose file</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    rows={8}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md shadow-sm text-white font-medium text-center 
                  ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  id ? 'Update Product' : 'Create Product'
                )}
              </button>
                          </div>
          </form>
        </div>
        
        {/* Additional form validation messages */}
        <div className="mt-4 text-sm text-gray-500">
          <p>* Required fields</p>
        </div>
        
        {/* Delete button for edit mode */}
        {id && (
          <div className="mt-6">
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                  try {
                    setLoading(true);
                    const token = localStorage.getItem('token');
                    if (token) {
                      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    }
                    
                    await axios.delete(`/api/products/${id}`);
                    setSuccess(true);
                    setLoading(false);
                    
                    setTimeout(() => {
                      navigate('/admin/products');
                    }, 1500);
                  } catch (err) {
                    console.error('Error deleting product:', err);
                    setError(err.response?.data?.message || 'Failed to delete product. Please try again.');
                    setLoading(false);
                  }
                }
              }}
              disabled={loading}
              className="w-full py-3 px-4 rounded-md shadow-sm text-white font-medium text-center bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              Delete Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductForm;