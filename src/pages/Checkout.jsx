import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/UI/Loader";
import ImageHandler from "../components/UI/ImageHandler";

const Checkout = () => {
  const { cartItems, cartTotal, clearCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");

  // Handle shipping form changes
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle payment method change
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate cart is not empty
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create order
      const order = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          qty: item.quantity,
          price: item.price,
          image: item.image,
          size: item.size || null,
          color: item.color || null,
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: cartTotal,
        shippingPrice: 0, // You can calculate shipping cost based on your business rules
        taxPrice: cartTotal * 0.1, // Example: 10% tax
        totalPrice: cartTotal + cartTotal * 0.1, // Total + tax
      };

      // Send order to API
      const res = await axios.post("http://localhost:5000/api/orders", order);

      // Clear cart
      clearCart();

      // Redirect to order confirmation
      navigate(`/order/${res.data._id}`, {
        state: {
          success: true,
          message: "Order placed successfully!",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to place order. Please try again."
      );
      setLoading(false);
    }
  };

  if (cartLoading) return <Loader />;

  // Redirect to cart if there are no items
  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleShippingChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleShippingChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleShippingChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleShippingChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="card"
                    name="paymentMethod"
                    type="radio"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={handlePaymentMethodChange}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label
                    htmlFor="card"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Credit/Debit Card
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="paypal"
                    name="paymentMethod"
                    type="radio"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={handlePaymentMethodChange}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label
                    htmlFor="paypal"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    PayPal
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="cod"
                    name="paymentMethod"
                    type="radio"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={handlePaymentMethodChange}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label
                    htmlFor="cod"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Cash on Delivery
                  </label>
                </div>
              </div>

              {/* Credit Card Form (shown only if card is selected) */}
              {paymentMethod === "card" && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="cardName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Name on Card
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="cardNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      className="w-full p-2 border rounded-md"
                      placeholder="XXXX XXXX XXXX XXXX"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="expDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      id="expDate"
                      className="w-full p-2 border rounded-md"
                      placeholder="MM/YY"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cvv"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      className="w-full p-2 border rounded-md"
                      placeholder="XXX"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {/* Products */}
            <div className="max-h-96 overflow-y-auto mb-4">
              {cartItems.map((item) => (
                <div
                  key={`${item._id}-${item.size}-${item.color}`}
                  className="flex mb-4"
                >
                  <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded">
                    {item.image ? (
                      <ImageHandler
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
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.color && ` | `}
                      {item.color && `Color: ${item.color}`}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>
                        ${item.price.toFixed(2)} x {item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>$0.00</span>
              </div>

              <div className="flex justify-between mb-2">
                <span>Tax (10%)</span>
                <span>${(cartTotal * 0.1).toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                <span>Total</span>
                <span>${(cartTotal + cartTotal * 0.1).toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full mt-6 px-6 py-3 rounded-md font-semibold ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
