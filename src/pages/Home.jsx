import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/products/ProductCard";
import Loader from "../components/UI/Loader";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // Fetch featured products
        const featuredRes = await axios.get(
          "http://localhost:5000/api/products?featured=true&limit=4"
        );
        setFeaturedProducts(featuredRes.data.products);

        // Fetch new arrivals
        const newArrivalsRes = await axios.get(
          "http://localhost:5000/api/products?sort=-createdAt&limit=4"
        );
        setNewArrivals(newArrivalsRes.data.products);

        setLoading(false);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white">
        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="assests/vid.mp4" type="video/mp4" />
        </video>

        {/* Overlay (optional for dark tint over video) */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative container mx-auto px-4 py-16 md:py-24 flex flex-col items-center z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Discover Your Style
          </h1>
          <p className="text-lg max-w-2xl mb-8">
            Explore our collection of premium clothing for men, women, and kids.
            Quality fabrics, trendy designs, and unbeatable prices.
          </p>
          <div className="flex space-x-4">
            <Link
              to="/products"
              className="bg-white text-gray-900 px-6 py-3 rounded-md font-semibold hover:bg-gray-200 transition"
            >
              Shop Now
            </Link>
            <Link
              to="/products?category=new"
              className="border border-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-gray-900 transition"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-10">
          Shop By Category
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/products?category=men" className="block group">
            <div className="relative overflow-hidden rounded-lg h-64">
              <div className="absolute inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition">
                <h3 className="text-white text-2xl font-bold">Men's</h3>
              </div>
              <div className="bg-gray-300 h-full w-full">
                <img
                  src="/assests/men.jpg"
                  alt="Men's collection"
                  className="w-full h-full object-cover"
                  loading="lazy" // Lazy loading for better performance
                />

                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-gray-600">Men's Collection</span>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/products?category=women" className="block group">
            <div className="relative overflow-hidden rounded-lg h-64">
              <div className="absolute inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition">
                <h3 className="text-white text-2xl font-bold">Women's</h3>
              </div>
              <div className="bg-gray-300 h-full w-full">
                <img
                  src="/assests/women.jpg"
                  alt="Men's collection"
                  className="w-full h-full object-cover"
                  loading="lazy" // Lazy loading for better performance
                />
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-gray-600">Women's Collection</span>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/products?category=kids" className="block group">
            <div className="relative overflow-hidden rounded-lg h-64">
              <div className="absolute inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition">
                <h3 className="text-white text-2xl font-bold">Kids</h3>
              </div>
              <div className="bg-gray-300 h-full w-full">
                <img
                  src="/assests/kids.jpg"
                  alt="Men's collection"
                  className="w-full h-full object-cover"
                  loading="lazy" // Lazy loading for better performance
                />
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-gray-600">Kids Collection</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">
            Featured Products
          </h2>

          {error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-block bg-gray-800 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-700 transition"
            >
              View All Products
            </Link>
          </div>
        </div>
      </div>

      {/* New Arrivals Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-10">New Arrivals</h2>

        {error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/products?sort=newest"
            className="inline-block bg-gray-800 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-700 transition"
          >
            See More
          </Link>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Subscribe to our Newsletter
            </h3>
            <p className="mb-6">
              Get the latest updates on new products and upcoming sales
            </p>

            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-md text-gray-900"
                required
              />
              <button
                type="submit"
                className="bg-white text-gray-900 px-6 py-3 rounded-md font-semibold hover:bg-gray-200 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
