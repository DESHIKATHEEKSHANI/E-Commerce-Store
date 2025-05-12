import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ImageHandler from '../../components/UI/ImageHandler';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      // Make sure we have a user before attempting to fetch orders
      if (!user) {
        console.error("User is not authenticated");
        setError("Please log in to view your orders");
        setLoading(false);
        return;
      }

      try {
        // Get token directly from localStorage for consistency
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          "http://localhost:5000/api/orders/myorders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(
          err.response?.data?.message || "Failed to load your orders"
        );
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]); // Re-run when user changes

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Determine badge color based on derived status
  const getStatusBadgeColor = (order) => {
    const status = deriveOrderStatus(order);
    
    switch (status.toLowerCase()) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Derive order status from order data since there's no explicit status field
  const deriveOrderStatus = (order) => {
    // If the order has been cancelled (you may need to add a field for this in your schema)
    if (order.isCancelled) return "Cancelled";
    
    // If the order has been delivered (you may need to add isDelivered field in your schema)
    if (order.isDelivered) return "Delivered";
    
    // If payment is completed
    if (order.isPaid) {
      // You might want to check if there's a shipping/tracking info to determine if it's shipped
      if (order.trackingNumber || (order.paymentResult && order.paymentResult.status === "shipped")) {
        return "Shipped";
      }
      return "Processing";
    }
    
    // Check payment status if it exists
    if (order.paymentResult && order.paymentResult.status) {
      if (order.paymentResult.status === "pending") return "Processing";
      return order.paymentResult.status; // Use the payment status if available
    }
    
    // Default status for new orders
    return "Processing";
  };
  
  // Format status text with capitalization
  const formatStatus = (order) => {
    const status = deriveOrderStatus(order);
    return status.charAt(0).toUpperCase() + status.slice(1);
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
        <div className="mt-4">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Order History</h1>
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">
            You haven't placed any orders yet.
          </p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {orders.map((order) => (
            <div key={order._id} className="border-b border-gray-200 p-6">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm">Order Placed</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total</p>
                  <p className="font-medium">${order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Order ID</p>
                  <p className="font-medium">{order._id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Status</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(
                      order
                    )}`}
                  >
                    {formatStatus(order)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium mb-2">Order Items:</h3>
                <div className="space-y-2">
                  {order.orderItems && order.orderItems.map((item) => (
                    <div key={item.product} className="flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <ImageHandler
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-gray-500 text-sm">
                          Qty: {item.qty || item.quantity}{" "}
                          {item.size && `• Size: ${item.size}`}{" "}
                          {item.color && `• Color: ${item.color}`}
                        </p>
                        <p className="text-gray-600">
                          ${item.price ? item.price.toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;