import { useState } from 'react';

const ImageHandler = ({ src, alt, className = "w-full h-full object-cover" }) => {
  const [imageError, setImageError] = useState(false);
  
  // Normalize image URL
  const getImageUrl = (imagePath) => {
    // Check if the path is already a full URL
    if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
      return imagePath;
    }
    
    // Handle local server paths (add server URL prefix)
    if (imagePath && !imagePath.startsWith('/')) {
      return `http://localhost:5000/${imagePath}`;
    }
    
    // If path starts with /, it's likely a local path
    if (imagePath && imagePath.startsWith('/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    // Default placeholder
    return "/placeholder-image.jpg";
  };

  return (
    <img
      src={imageError ? "/placeholder-image.jpg" : getImageUrl(src)}
      alt={alt || "Product image"}
      className={className}
      onError={() => setImageError(true)}
    />
  );
};

export default ImageHandler;