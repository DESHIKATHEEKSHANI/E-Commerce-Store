import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ImageHandler from '../../components/UI/ImageHandler';


const AdminDashboard = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Make sure Authorization header is set with the token
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Fetch dashboard stats
        const statsRes = await axios.get('/api/admin/dashboard');
        setStats(statsRes.data);

        // Fetch recent orders
        const ordersRes = await axios.get('/api/orders?limit=5');
        setRecentOrders(ordersRes.data);

        // Fetch recent products
        const productsRes = await axios.get('/api/products?limit=5');
        setRecentProducts(productsRes.data.products); // Note the `.products`


        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch order details when modal is opened
  const handleViewOrder = async (orderId) => {
    try {
      setOrderLoading(true);
      setSelectedOrder(orderId);
      setShowOrderModal(true);
      
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios.get(`/api/orders/${orderId}`);
      setOrderDetails(response.data);
      setOrderLoading(false);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
      setOrderLoading(false);
    }
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  // Status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, {user?.name || 'Admin'}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm uppercase mb-2">Total Sales</h2>
          <p className="text-3xl font-bold">${stats.totalSales.toFixed(2)}</p>
          <div className="mt-2 text-sm text-green-600">
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              12% from last month
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm uppercase mb-2">Total Orders</h2>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
          <div className="mt-2 text-sm text-gray-600">
            <span>{stats.pendingOrders} pending</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm uppercase mb-2">Total Products</h2>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
          <div className="mt-2 text-sm text-gray-600">
            <Link to="/admin/products" className="text-blue-600 hover:underline">
              Manage inventory
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm uppercase mb-2">Conversion Rate</h2>
          <p className="text-3xl font-bold">3.6%</p>
          <div className="mt-2 text-sm text-red-600">
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              0.8% from last month
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link 
              to="/admin/products/new" 
              className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add New Product
            </Link>
            <Link 
              to="/admin/orders" 
              className="block w-full text-center bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
            >
              Manage Orders
            </Link>
            <Link 
              to="/admin/products" 
              className="block w-full text-center bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
            >
              Manage Products
            </Link>
            <Link 
              to="/admin/users" 
              className="block w-full text-center bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
            >
              Manage Users
            </Link>
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-gray-500 text-sm font-medium">Order ID</th>
                  <th className="px-4 py-2 text-left text-gray-500 text-sm font-medium">Customer</th>
                  <th className="px-4 py-2 text-left text-gray-500 text-sm font-medium">Date</th>
                  <th className="px-4 py-2 text-left text-gray-500 text-sm font-medium">Amount</th>
                  <th className="px-4 py-2 text-left text-gray-500 text-sm font-medium">Status</th>
                  <th className="px-4 py-2 text-left text-gray-500 text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-4 py-3 whitespace-nowrap">#{order._id.slice(-5)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{order.user?.name || 'Guest'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">${order.totalPrice?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(order.status)}`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Processing'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button 
                          onClick={() => handleViewOrder(order._id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-3 text-center text-gray-500">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Products</h2>
          <Link to="/admin/products" className="text-blue-600 hover:text-blue-800 text-sm">
            View All Products
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {recentProducts.length > 0 ? (
            recentProducts.map((product) => (
              <div key={product._id} className="border rounded-lg overflow-hidden">
                <div className="h-36 bg-gray-200">
                  {product.image ? (
                    <ImageHandler
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/api/placeholder/150/150';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm truncate">${product.price?.toFixed(2) || '0.00'}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${product.countInStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.countInStock > 0 ? `In Stock: ${product.countInStock}` : 'Out of Stock'}
                    </span>
                    <Link to={`/admin/products/${product._id}/edit`} className="text-blue-600 hover:text-blue-800 text-sm">
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-5 text-center text-gray-500 py-8">
              No products found. <Link to="/admin/products/new" className="text-blue-600 hover:underline">Add your first product</Link>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Order Details</h3>
                <button 
                  onClick={closeOrderModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {orderLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : orderDetails ? (
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Order ID:</p>
                        <p className="font-medium">#{orderDetails._id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date:</p>
                        <p className="font-medium">{formatDate(orderDetails.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Customer:</p>
                        <p className="font-medium">{orderDetails.user?.name || 'Guest'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email:</p>
                        <p className="font-medium">{orderDetails.user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount:</p>
                        <p className="font-medium">${orderDetails.totalPrice?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status:</p>
                        <p className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${getStatusBadgeColor(orderDetails.status)}`}>
                          {orderDetails.status?.charAt(0).toUpperCase() + orderDetails.status?.slice(1) || 'Processing'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Shipping Information */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Shipping Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><span className="text-gray-500">Address:</span> {orderDetails.shippingAddress?.address}</p>
                      <p><span className="text-gray-500">City:</span> {orderDetails.shippingAddress?.city}</p>
                      <p><span className="text-gray-500">Postal Code:</span> {orderDetails.shippingAddress?.postalCode}</p>
                      <p><span className="text-gray-500">Country:</span> {orderDetails.shippingAddress?.country}</p>
                    </div>
                  </div>
                  
                  {/* Payment Information */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Payment Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><span className="text-gray-500">Payment Method:</span> {orderDetails.paymentMethod}</p>
                      <p><span className="text-gray-500">Paid:</span> {orderDetails.isPaid ? formatDate(orderDetails.paidAt) : 'Not paid'}</p>
                      <p><span className="text-gray-500">Delivered:</span> {orderDetails.isDelivered ? formatDate(orderDetails.deliveredAt) : 'Not delivered'}</p>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Order Items</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="text-left font-medium text-gray-500 pb-2">Product</th>
                            <th className="text-left font-medium text-gray-500 pb-2">Quantity</th>
                            <th className="text-left font-medium text-gray-500 pb-2">Price</th>
                            <th className="text-left font-medium text-gray-500 pb-2">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orderDetails.orderItems && orderDetails.orderItems.map((item, index) => (
                            <tr key={index}>
                              <td className="py-2">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 bg-gray-200 mr-2 flex-shrink-0">
                                    {item.image ? (
                                      <ImageHandler
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = '/api/placeholder/40/40';
                                        }}
                                      />
                                    ) : (
                                      <div className="flex items-center justify-center h-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-gray-900 font-medium">{item.name}</span>
                                </div>
                              </td>
                              <td className="py-2">{item.qty}</td>
                              <td className="py-2">${item.price?.toFixed(2) || '0.00'}</td>
                              <td className="py-2">${(item.qty * item.price).toFixed(2) || '0.00'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Order Summary */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Order Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Items:</span>
                        <span>${orderDetails.itemsPrice?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Shipping:</span>
                        <span>${orderDetails.shippingPrice?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Tax:</span>
                        <span>${orderDetails.taxPrice?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between py-1 font-bold">
                        <span>Total:</span>
                        <span>${orderDetails.totalPrice?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={closeOrderModal}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                    >
                      Close
                    </button>
                    
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Failed to load order details. Please try again.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;