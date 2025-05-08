import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/UI/Loader';

const Cart = () => {
  const { cartItems, loading, updateCartItem, removeFromCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (id, newQuantity, size, color) => {
    if (newQuantity < 1) return;
    updateCartItem(id, newQuantity, size, color);
  };

  const handleRemoveItem = (id, size, color) => {
    removeFromCart(id, size, color);
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600 mb-6">Your cart is empty.</p>
          <Link 
            to="/products" 
            className="bg-gray-800 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <tr key={`${item._id}-${item.size}-${item.color}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="h-16 w-16 object-contain"
                              />
                            ) : (
                              <div className="h-16 w-16 flex items-center justify-center text-gray-500 text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <Link 
                              to={`/product/${item._id}`} 
                              className="font-medium text-gray-900 hover:text-blue-600"
                            >
                              {item.name}
                            </Link>
                            {item.size && (
                              <div className="text-sm text-gray-500">Size: {item.size}</div>
                            )}
                            {item.color && (
                              <div className="text-sm text-gray-500">
                                Color: 
                                <span 
                                  className="ml-1 inline-block w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: item.color.toLowerCase() }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center border rounded w-24">
                          <button
                            className="px-2 py-1 text-gray-600 hover:text-gray-800"
                            onClick={() => 
                              handleQuantityChange(item._id, item.quantity - 1, item.size, item.color)
                            }
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => 
                              handleQuantityChange(
                                item._id, 
                                parseInt(e.target.value), 
                                item.size, 
                                item.color
                              )
                            }
                            className="w-10 text-center border-none focus:outline-none"
                          />
                          <button
                            className="px-2 py-1 text-gray-600 hover:text-gray-800"
                            onClick={() => 
                              handleQuantityChange(item._id, item.quantity + 1, item.size, item.color)
                            }
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveItem(item._id, item.size, item.color)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 shadow">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              
              <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-md font-semibold hover:bg-gray-700 mt-6"
              >
                Proceed to Checkout
              </button>
              
              <Link 
                to="/products" 
                className="w-full block text-center text-gray-600 mt-4 hover:text-gray-800"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;