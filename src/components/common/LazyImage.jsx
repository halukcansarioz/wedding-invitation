import React, { useState } from 'react';

export function LazyImage({ src, alt, className, style, onClick }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className={`lazy-image-wrapper ${className || ''}`} 
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      onClick={onClick}
    >
      {!isLoaded && (
        <div 
          className="image-skeleton" 
          style={{ 
            position: 'absolute', inset: 0, 
            background: 'linear-gradient(90deg, rgba(217, 140, 161, 0.1) 25%, rgba(217, 140, 161, 0.2) 50%, rgba(217, 140, 161, 0.1) 75%)', 
            backgroundSize: '200% 100%', animation: 'skeleton-loading 1.5s infinite' 
          }} 
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        style={{ 
          width: '100%', height: '100%', objectFit: 'cover', 
          opacity: isLoaded ? 1 : 0, transition: 'opacity 0.4s ease' 
        }}
      />
    </div>
  );
}