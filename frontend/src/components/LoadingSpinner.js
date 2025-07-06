// frontend/src/components/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ 
  size = 'default', 
  message = 'Loading...', 
  fullScreen = false,
  color = 'white'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const colorClasses = {
    white: 'border-white/20 border-t-white',
    blue: 'border-blue-200 border-t-blue-500',
    green: 'border-green-200 border-t-green-500',
    red: 'border-red-200 border-t-red-500'
  };

  const spinnerElement = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div 
        className={`${sizeClasses[size]} border-2 rounded-full animate-spin ${colorClasses[color]}`}
      ></div>
      {message && (
        <p className={`text-sm ${color === 'white' ? 'text-white' : `text-${color}-600`} animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

// Skeleton loader component for content placeholders
export const SkeletonLoader = ({ 
  lines = 3, 
  className = '',
  showAvatar = false 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {showAvatar && (
        <div className="flex items-center mb-4 space-x-4">
          <div className="w-12 h-12 rounded-full bg-zinc-700"></div>
          <div className="flex-1 space-y-2">
            <div className="w-1/4 h-4 rounded bg-zinc-700"></div>
            <div className="w-1/6 h-3 rounded bg-zinc-700"></div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 rounded bg-zinc-700"></div>
            {i === lines - 1 && (
              <div className="w-5/6 h-4 rounded bg-zinc-700"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Page loading component with drip branding
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-widest text-white">drip</h1>
          <div className="w-24 h-1 mx-auto overflow-hidden rounded-full bg-white/20">
            <div className="h-full bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
        <LoadingSpinner size="large" message={message} />
      </div>
    </div>
  );
};

export default LoadingSpinner;