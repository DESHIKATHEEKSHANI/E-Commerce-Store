import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get('/api/admin/dashboard');
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mock data for recent orders (would come from API)
  const recentOrders = [
    {
      _id: 'ord12345',
      customer: 'John Doe',
      date: '2025-05-08',
      total: 129.99,
      status: 'processing'
    },
    {
      _id: 'ord12346',
      customer: 'Jane Smith',
      date: '2025-05-07',
      total: 89.50,
      status: 'shipped'
    },
    {
      _id: 'ord12347',
      customer: 'Mike Johnson',
      date: '2025-05-06',
      total: 215.75,
      status: 'delivered'
    }
  ];

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
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm uppercase mb-2">Total Sales</h2>
          <p className="text-3xl font-bold">${stats.totalSales.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm uppercase mb-2">Total Orders</h2>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm uppercase mb-2">Total Products</h2>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm uppercase mb-2">Pending Orders</h2>
          <p className="text-3xl font-bold">{stats.pendingOrders}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-3 whitespace-nowrap">#{order._id.slice(-5)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{order.customer}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{order.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link to={`/admin/orders/${order._id}`} className="text-blue-600 hover:text-blue-800">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;