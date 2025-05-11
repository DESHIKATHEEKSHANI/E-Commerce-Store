import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import ImageHandler from "../UI/ImageHandler"; // Import our new component

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  // Calculate discount percentage if there's a sale price
  const discountPercentage =
    product.salePrice &&
    Math.round(((product.price - product.salePrice) / product.price) * 100);

  // Get the appropriate image source
  const getProductImage = (product) => {
    // First try to get from images array
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }

    // Then try the image field
    if (product.image) {
      return product.image;
    }

    // Return null and let ImageHandler use the default placeholder
    return null;
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sale Tag */}
      {product.salePrice && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          {discountPercentage}% OFF
        </div>
      )}

      {/* Image */}
      <div className="relative pt-[100%] bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageHandler 
            src={getProductImage(product)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Quick Add Button */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-center py-2 transform transition-transform ${
            isHovered ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <button onClick={handleAddToCart} className="w-full font-medium">
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 group-hover:text-gray-600 truncate">
          {product.name}
        </h3>

        <div className="mt-1 flex items-center">
          {/* Star Rating */}
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(product.rating || 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1 text-xs text-gray-500">
              ({product.numReviews || 0} reviews)
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-center">
          {product.salePrice ? (
            <>
              <span className="text-red-600 font-medium">
                ${product.salePrice.toFixed(2)}
              </span>
              <span className="ml-2 text-gray-500 text-sm line-through">
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-gray-900 font-medium">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-2">
          {product.countInStock > 0 ? (
            <span className="text-xs text-green-600">In Stock</span>
          ) : (
            <span className="text-xs text-red-600">Out of Stock</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;