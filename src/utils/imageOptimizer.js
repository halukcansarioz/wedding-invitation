import { MAX_IMAGE_DIMENSION, IMAGE_QUALITY } from "../config/constants";

function fallbackOptimize(file, resolve) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    let { width, height } = img;
    const maxDim = MAX_IMAGE_DIMENSION || 1400;
    
    if (width > maxDim || height > maxDim) {
      if (width > height) { 
        height = Math.round((height * maxDim) / width); 
        width = maxDim; 
      } else { 
        width = Math.round((width * maxDim) / height); 
        height = maxDim; 
      }
    }
    
    canvas.width = width; 
    canvas.height = height;
    canvas.getContext("2d").drawImage(img, 0, 0, width, height);
    
    canvas.toBlob((blob) => {
      resolve(blob ? new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), { type: "image/webp" }) : file);
    }, "image/webp", IMAGE_QUALITY || 0.8);
  };
  img.onerror = () => resolve(file);
  img.src = URL.createObjectURL(file);
}

export async function optimizeImage(file) {
  if (!file) return file;

  // Geçersiz dosya formatları direkt bypass ediliyor
  if (!file.type.startsWith("image/") && !file.name.toLowerCase().endsWith('.heic')) return file;
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  return new Promise((resolve) => {
    // Worker modül olarak başlatılıyor ki import fonksiyonlarını tanısın
    const worker = new Worker(new URL('./imageWorker.js', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e) => {
      if (e.data.blob) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        const optimizedFile = new File([e.data.blob], `${cleanName}.webp`, {
          type: "image/webp",
          lastModified: Date.now(),
        });
        resolve(optimizedFile);
      } else if (e.data.error === "OffscreenCanvas not supported") {
        fallbackOptimize(e.data.file, resolve); 
      } else {
        resolve(e.data.file); 
      }
      worker.terminate();
    };

    worker.onerror = () => {
      fallbackOptimize(file, resolve);
      worker.terminate();
    };

    worker.postMessage({ 
      file: file, 
      maxDim: MAX_IMAGE_DIMENSION || 1400, 
      quality: IMAGE_QUALITY || 0.8 
    });
  });
}

export async function optimizeImageFile(file, options = {}) {
  const { maxWidth = 1920, quality = 0.8 } = options;

  // Görsel değilse veya zaten küçük bir WebP/SVG ise doğrudan döndür
  if (!file || !file.type?.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  // Test ortamında (JSDOM / Webdriver) işlemi hızlandırmak için doğrudan döndür
  if (typeof window === 'undefined' || window.navigator?.webdriver) {
    return file;
  }

  // 1. Önce Web Worker ile arka planda sıkıştırmayı dene
  if (typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined') {
    try {
      const workerResult = await new Promise((resolve) => {
        const worker = new Worker(new URL('./imageWorker.js', import.meta.url), { type: 'module' });
        const timeoutId = setTimeout(() => {
          worker.terminate();
          resolve({ success: false, fallback: true });
        }, 8000);

        worker.onmessage = (event) => {
          clearTimeout(timeoutId);
          worker.terminate();
          resolve(event.data);
        };

        worker.onerror = () => {
          clearTimeout(timeoutId);
          worker.terminate();
          resolve({ success: false, fallback: true });
        };

        worker.postMessage({ file, maxWidth, quality });
      });

      if (workerResult?.success && workerResult.blob) {
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        return new File([workerResult.blob], `${baseName}.webp`, { type: 'image/webp' });
      }
    } catch {
      // Hata durumunda Canvas fallback'e geç
    }
  }

  // 2. Canvas Fallback (Safari / Eski Tarayıcılar)
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          resolve(new File([blob], `${baseName}.webp`, { type: 'image/webp' }));
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}