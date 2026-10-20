import { useState, useEffect } from 'react';

export function useAssetPreloader(mediaUrl?: string | null): boolean {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!mediaUrl) {
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);

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