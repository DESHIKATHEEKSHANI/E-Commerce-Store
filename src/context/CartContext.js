import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing cart data:', error);
        setCartItems([]);
      }
    }
    setLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  // Add item to cart
  const addToCart = (product, quantity = 1, size = null, color = null) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        item => item._id === product._id && item.size === size && item.color === color
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, { 
          ...product, 
          quantity, 
          size, 
          color 
        }];
      }
    });
  };

  // Update cart item
  const updateCartItem = (id, quantity, size = null, color = null) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item._id === id && item.size === size && item.color === color) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  // Remove from cart
  const removeFromCart = (id, size = null, color = null) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item._id === id && item.size === size && item.color === color))
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate totals
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );

  const cartQuantity = cartItems.reduce(
    (total, item) => total + item.quantity, 
    0
  );

  const value = {
    cartItems,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    cartTotal,
    cartQuantity
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;