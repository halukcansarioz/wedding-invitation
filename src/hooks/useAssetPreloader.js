import { useState, useEffect } from 'react';

export function useAssetPreloader(mediaUrl) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mediaUrl) {
      setIsLoaded(true);
      return;
    }

    const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i);

    if (isVideo) {
      const video = document.createElement('video');
      video.src = mediaUrl;
      video.onloadeddata = () => setIsLoaded(true);
      video.onerror = () => setIsLoaded(true);
      video.load();
    } else {
      const img = new Image();
      img.src = mediaUrl;
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setIsLoaded(true);
    }
  }, [mediaUrl]);

  return isLoaded;
}