import { useState, useEffect } from 'react';

export function useAssetPreloader(imageUrl) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setIsLoaded(true);
      return;
    }
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsLoaded(true); // Görsel kırıksa da sitenin açılmasına izin ver
  }, [imageUrl]);

  return isLoaded;
}