import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="mb-4">
          <p className="text-gray-600">Name:</p>
          <p className="font-medium">{user?.name}</p>
        </div>
        <div className="mb-4">
          <p className="text-gray-600">Email:</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div className="mt-4">
          <button className="text-blue-600 hover:text-blue-800">
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order History</h2>
          <p className="text-gray-600 mb-4">View and track your orders</p>
          <Link 
            to="/orders" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
          >
            View Orders
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Addresses</h2>
          <p className="text-gray-600 mb-4">Manage your shipping addresses</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Manage Addresses
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;