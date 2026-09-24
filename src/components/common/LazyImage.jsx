import React, { useState } from 'react';

export function LazyImage({ src, alt, className, style, onClick, aspectRatio = "1 / 1" }) {
  const [isLoaded, setIsLoaded] = useState(false);

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
        src={src} // DÜZELTİLDİ: Supabase Pro'ya özel olan `/render/image/` dönüşümü kaldırıldı!
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