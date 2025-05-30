import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const res = await axios.get(
          'http://localhost:5000/api/orders',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        // Add derived status to each order
        const ordersWithStatus = res.data.map(order => ({
          ...order,
          derivedStatus: deriveOrderStatus(order)
        }));
        
        setOrders(ordersWithStatus);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError('Failed to load orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Derive order status from order data
  const deriveOrderStatus = (order) => {
    // If the order has a status field directly, use it
    if (order.status) return order.status;
    
    // If the order has been delivered or cancelled
    if (order.isDelivered) return "delivered";
    if (order.isCancelled) return "cancelled";
    
    // If payment is completed
    if (order.isPaid) {
      // Check if there's tracking info to determine if shipped
      if (order.trackingNumber) {
        return "shipped";
      }
      return "processing";
    }
    
    // Check payment status if it exists
    if (order.paymentResult && order.paymentResult.status) {
      if (order.paymentResult.status === "pending") return "processing";
      if (order.paymentResult.status === "shipped") return "shipped";
      return order.paymentResult.status;
    }
    
    // Default status for new orders
    return "processing";
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update local state
      setOrders(orders.map(order => {
        if (order._id === orderId) {
          // Update the derived status
          return { 
            ...order, 
            derivedStatus: newStatus,
            // Also update relevant fields based on the new status
            isPaid: newStatus !== 'processing',
            isDelivered: newStatus === 'delivered',
            paymentResult: {
              ...order.paymentResult,
              status: newStatus === 'processing' ? 'pending' : 'completed'
            }
          };
        }
        return order;
      }));
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError('Failed to update order status');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter orders based on status
  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.derivedStatus === filter);

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Determine badge color based on status
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
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

  // Get user name
  const getUserName = (order) => {
    if (order.user && typeof order.user === 'object' && order.user.name) {
      return order.user.name;
    }
    if (order.shippingAddress && order.shippingAddress.fullName) {
      return order.shippingAddress.fullName;
    }
    return 'Guest';
  };

  // Get user email
  const getUserEmail = (order) => {
    if (order.user && typeof order.user === 'object' && order.user.email) {
      return order.user.email;
    }
    if (order.paymentResult && order.paymentResult.email_address) {
      return order.paymentResult.email_address;
    }
    if (order.shippingAddress && order.shippingAddress.email) {
      return order.shippingAddress.email;
    }
    return '';
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      {/* Filter tabs */}
      <div className="flex flex-wrap border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            filter === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setFilter('all');
            setCurrentPage(1);
          }}
        >
          All Orders
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            filter === 'processing' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setFilter('processing');
            setCurrentPage(1);
          }}
        >
          Processing
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            filter === 'shipped' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setFilter('shipped');
            setCurrentPage(1);
          }}
        >
          Shipped
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            filter === 'delivered' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setFilter('delivered');
            setCurrentPage(1);
          }}
        >
          Delivered
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            filter === 'cancelled' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setFilter('cancelled');
            setCurrentPage(1);
          }}
        >
          Cancelled
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No orders found with the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order._id.slice(-6)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getUserName(order)}</div>
                      <div className="text-sm text-gray-500">{getUserEmail(order)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.paymentMethod}</div>
                      <div className="text-sm text-gray-500">
                        {order.isPaid ? 'Paid' : 'Not Paid'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(order.derivedStatus)}`}
                      >
                        {order.derivedStatus.charAt(0).toUpperCase() + order.derivedStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          View
                        </Link>
                        <select
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          value={order.derivedStatus}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 flex flex-col md:flex-row justify-between items-center border-t border-gray-200">
              <div className="mb-3 md:mb-0">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastOrder, filteredOrders.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredOrders.length}</span> results
                </p>
              </div>
              <div>
                <nav className="flex items-center">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  {totalPages <= 5 ? (
                    // If 5 or fewer pages, show all page numbers
                    [...Array(totalPages).keys()].map((number) => (
                      <button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`mx-1 px-3 py-1 rounded ${
                          currentPage === number + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        {number + 1}
                      </button>
                    ))
                  ) : (
                    // If more than 5 pages, show logical pagination
                    <>
                      {/* First page always shown */}
                      <button
                        onClick={() => paginate(1)}
                        className={`mx-1 px-3 py-1 rounded ${
                          currentPage === 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        1
                      </button>
                      
                      {/* Ellipsis if not near first page */}
                      {currentPage > 3 && 
                        <span className="mx-1">...</span>
                      }
                      
                      {/* Pages around current page */}
                      {[...Array(5).keys()]
                        .map(n => n - 2 + currentPage)
                        .filter(n => n > 1 && n < totalPages)
                        .map(number => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`mx-1 px-3 py-1 rounded ${
                              currentPage === number
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                          >
                            {number}
                          </button>
                        ))
                      }
                      
                      {/* Ellipsis if not near last page */}
                      {currentPage < totalPages - 2 && 
                        <span className="mx-1">...</span>
                      }
                      
                      {/* Last page always shown */}
                      <button
                        onClick={() => paginate(totalPages)}
                        className={`mx-1 px-3 py-1 rounded ${
                          currentPage === totalPages
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;