import React from 'react';

const Loader = ({ size = 'default' }) => {
  // Size variants
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    default: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.default;

  return (
    <div className="flex justify-center items-center py-12 w-full">
      <div 
        className={`${spinnerSize} rounded-full border-gray-300 border-t-gray-800 animate-spin`}
        aria-label="Loading"
      ></div>
    </div>
  );
};

export default Loader;