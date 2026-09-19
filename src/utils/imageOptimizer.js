import { MAX_IMAGE_DIMENSION, IMAGE_QUALITY } from "../config/constants";

// OffscreenCanvas desteklenmeyen tarayıcılar (Eski Safari vb.) için Main-Thread Fallback
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
  if (!file || !file.type.startsWith("image/")) return file;
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  return new Promise((resolve) => {
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
        fallbackOptimize(file, resolve); // Desteklenmiyorsa fallback çalıştır
      } else {
        resolve(file); 
      }
      worker.terminate();
    };

    worker.onerror = () => {
      fallbackOptimize(file, resolve); // Worker çökerse fallback çalıştır
      worker.terminate();
    };

    worker.postMessage({ 
      file, 
      maxDim: MAX_IMAGE_DIMENSION || 1400, 
      quality: IMAGE_QUALITY || 0.8 
    });
  });
}