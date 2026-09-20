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
      style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        aspectRatio, 
        backgroundColor: 'var(--paper-soft)', 
        ...style 
      }}
      onClick={onClick}
    >
      {/* İskelet Arka Planı ve Animasyonu */}
      {!isLoaded && (
        <div 
          className="image-skeleton" 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(110deg, var(--paper-soft) 8%, var(--rose-light) 18%, var(--paper-soft) 33%)', 
            backgroundSize: '200% 100%', 
            animation: 'skeleton-loading 1.8s linear infinite',
            zIndex: 1
          }} 
        />
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover', 
          opacity: isLoaded ? 1 : 0, 
          filter: isLoaded ? 'blur(0)' : 'blur(10px)',
          transform: isLoaded ? 'scale(1)' : 'scale(1.05)',
          transition: 'opacity 0.6s ease-out, filter 0.6s ease-out, transform 0.6s ease-out',
          position: 'relative',
          zIndex: 2
        }}
      />
    </div>
  );
}