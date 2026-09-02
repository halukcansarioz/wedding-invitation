import React, { useState, useMemo } from 'react';

export function LazyImage({ src, alt, className, style, onClick, aspectRatio = "1 / 1", width = 800 }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const optimizedSrc = useMemo(() => {
    if (!src || typeof src !== 'string') return src;
    if (src.includes('.supabase.co/storage/v1/object/public/')) {
      return src.replace('/object/public/', '/render/image/public/') + `?width=${width}&quality=80`;
    }
    return src;
  }, [src, width]);

  return (
    <div 
      className={`lazy-image-wrapper ${className || ''}`} 
      style={{ position: 'relative', overflow: 'hidden', aspectRatio, ...style }}
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
        src={optimizedSrc}
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