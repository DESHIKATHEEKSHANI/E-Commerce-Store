import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import Loader from "../components/UI/Loader";
import ImageHandler from "../components/UI/ImageHandler"; // Import the ImageHandler component

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);

        const fetchedProduct = {
          ...res.data,
          sizes: res.data.sizes || [],
          colors: res.data.colors || [],
        };
        setProduct(fetchedProduct);

        if (fetchedProduct.sizes.length > 0) {
          setSelectedSize(fetchedProduct.sizes[0]);
        }
        if (fetchedProduct.colors.length > 0) {
          setSelectedColor(fetchedProduct.colors[0]);
        }

        // Fetch related products only if category exists
        if (fetchedProduct.category) {
          const relatedRes = await axios.get(
            `http://localhost:5000/api/products?category=${encodeURIComponent(
              fetchedProduct.category
            )}&limit=4`
          );
          const filtered = relatedRes.data.products.filter(
            (p) => p._id !== fetchedProduct._id
          );
          setRelatedProducts(filtered);
        } else {
          setRelatedProducts([]);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load product details. Please try again later.");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(value > 0 ? value : 1);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(
        product,
        quantity,
        product.sizes && product.sizes.length > 0 ? selectedSize : null,
        product.colors && product.colors.length > 0 ? selectedColor : null
      );
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Product not found.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="text-sm mb-8">
        <ol className="list-none p-0 inline-flex">
          <li className="flex items-center">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <span className="mx-2 text-gray-500">/</span>
          </li>
          <li className="flex items-center">
            <Link to="/products" className="text-gray-500 hover:text-gray-700">
              Products
            </Link>
            <span className="mx-2 text-gray-500">/</span>
          </li>
          <li className="flex items-center">
            <Link
              to={`/products?category=${product.category}`}
              className="text-gray-500 hover:text-gray-700"
            >
              {product.category.charAt(0).toUpperCase() +
                product.category.slice(1)}
            </Link>
            <span className="mx-2 text-gray-500">/</span>
          </li>
          <li className="text-gray-700">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image - Using ImageHandler */}
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <div className="bg-gray-200 h-96 flex items-center justify-center">
            <ImageHandler 
              src={product.image}
              alt={product.name}
              className="object-contain h-full w-full"
            />
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="text-2xl font-semibold text-gray-800 mb-4">
            ${product.price.toFixed(2)}
          </div>

          {product.countInStock > 0 ? (
            <div className="text-green-600 mb-4">In Stock</div>
          ) : (
            <div className="text-red-600 mb-4">Out of Stock</div>
          )}

          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`px-4 py-2 border rounded-md ${
                      selectedSize === size
                        ? "border-gray-800 bg-gray-800 text-white"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color ? "ring-2 ring-gray-800" : ""
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={color}
                  ></button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-20 p-2 border rounded-md"
                disabled={product.countInStock === 0}
              />
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              className={`px-6 py-3 rounded-md font-semibold ${
                product.countInStock === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              Add to Cart
            </button>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-6">
            <div className="mb-2">
              <span className="font-semibold">Category:</span>{" "}
              <Link
                to={`/products?category=${product.category}`}
                className="text-blue-600 hover:underline"
              >
                {product.category.charAt(0).toUpperCase() +
                  product.category.slice(1)}
              </Link>
            </div>

            {product.brand && (
              <div className="mb-2">
                <span className="font-semibold">Brand:</span> {product.brand}
              </div>
            )}

            <div>
              <span className="font-semibold">SKU:</span>{" "}
              {product._id.substring(0, 8).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products - Using ImageHandler for each product */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <div
                key={relProduct._id}
                className="border rounded-lg overflow-hidden"
              >
                <Link to={`/product/${relProduct._id}`}>
                  <div className="bg-gray-200 h-48 flex items-center justify-center">
                    <ImageHandler
                      src={relProduct.image}
                      alt={relProduct.name}
                      className="object-contain h-full w-full"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{relProduct.name}</h3>
                    <div className="text-gray-800">
                      ${relProduct.price.toFixed(2)}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;