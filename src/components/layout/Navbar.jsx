import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { cartQuantity } = useCart();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="font-bold text-xl md:text-2xl">StyleShop</Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="hover:text-gray-300">Home</Link>
            <div className="relative group">
              <button className="hover:text-gray-300">Categories</button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                <div className="py-1">
                  <Link to="/products?category=men" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Men's</Link>
                  <Link to="/products?category=women" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Women's</Link>
                  <Link to="/products?category=kids" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Kids</Link>
                </div>
              </div>
            </div>
            <Link to="/products" className="hover:text-gray-300">All Products</Link>
            
            {/* Cart Icon with Counter */}
            <Link to="/cart" className="hover:text-gray-300 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartQuantity}
                </span>
              )}
            </Link>
            
            {/* Authentication Links */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="hover:text-gray-300">
                  Hi, {user.name}
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                  <div className="py-1">
                    <Link to="/dashboard" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Dashboard</Link>
                    <Link to="/orders" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">My Orders</Link>
                    {user.isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Admin Panel</Link>
                    )}
                    <button 
                      onClick={handleLogout} 
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="hover:text-gray-300">Login</Link>
                <Link to="/register" className="hover:text-gray-300">Register</Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden focus:outline-none" 
            onClick={toggleMobileMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link to="/" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/products?category=men" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Men's</Link>
            <Link to="/products?category=women" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Women's</Link>
            <Link to="/products?category=kids" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Kids</Link>
            <Link to="/products" className="block py-2" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
            <Link to="/cart" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
              Cart ({cartQuantity})
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <Link to="/orders" className="block py-2" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                {user.isAdmin && (
                  <Link to="/admin" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;