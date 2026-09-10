import { MAX_IMAGE_DIMENSION, IMAGE_QUALITY } from "../config/constants";

/**
 * Yüklenen görseli maksimum boyutlara göre ölçekler ve WebP formatında sıkıştırır.
 * Tarayıcının kilitlenmemesi için işlemi bir Web Worker içinde gerçekleştirir.
 */
export async function optimizeImage(file) {
  if (!file || !file.type.startsWith("image/")) {
    return file;
  }

  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve) => {
    // Web Worker'ı başlatıyoruz
    const worker = new Worker(new URL('./imageWorker.js', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e) => {
      if (e.data.blob) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        const optimizedFile = new File([e.data.blob], `${cleanName}.webp`, {
          type: "image/webp",
          lastModified: Date.now(),
        });
        resolve(optimizedFile);
      } else {
        resolve(file); // Hata durumunda orijinal dosyayı döndür
      }
      worker.terminate();
    };

    worker.onerror = () => {
      resolve(file); // Hata durumunda kilitlenmeyi önle
      worker.terminate();
    };

    worker.postMessage({ 
      file, 
      maxDim: MAX_IMAGE_DIMENSION || 1400, 
      quality: IMAGE_QUALITY || 0.8 
    });
  });
}