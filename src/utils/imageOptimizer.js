import imageCompression from 'browser-image-compression';

export const optimizeImage = async (imageFile) => {
  const options = {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(imageFile, options);
    return compressedFile;
  } catch (error) {
    console.error("Görsel sıkıştırma hatası:", error);
    return imageFile; // Hata olursa kırılmamak için orijinali döndürür
  }
};