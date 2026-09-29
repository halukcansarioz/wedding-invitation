import { MAX_IMAGE_DIMENSION, IMAGE_QUALITY } from "../config/constants";
import heic2any from "heic2any"; // npm install heic2any

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
  if (!file) return file;

  let processFile = file;

  // YENİ: iOS HEIC Desteği (Sunucuya gitmeden önce tarayıcıda JPEG'e çevrilir)
  if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
    try {
      const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
      // Eğer heic2any array dönerse ilkini alıyoruz
      const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      processFile = new File([finalBlob], file.name.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" });
    } catch (err) {
      console.error("HEIC dönüşüm hatası:", err);
    }
  }

  if (!processFile.type.startsWith("image/")) return processFile;
  if (processFile.type === "image/svg+xml" || processFile.type === "image/gif") return processFile;

  return new Promise((resolve) => {
    const worker = new Worker(new URL('./imageWorker.js', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e) => {
      if (e.data.blob) {
        const cleanName = processFile.name.replace(/\.[^/.]+$/, "");
        const optimizedFile = new File([e.data.blob], `${cleanName}.webp`, {
          type: "image/webp",
          lastModified: Date.now(),
        });
        resolve(optimizedFile);
      } else if (e.data.error === "OffscreenCanvas not supported") {
        fallbackOptimize(processFile, resolve); 
      } else {
        resolve(processFile); 
      }
      worker.terminate();
    };

    worker.onerror = () => {
      fallbackOptimize(processFile, resolve);
      worker.terminate();
    };

    worker.postMessage({ 
      file: processFile, 
      maxDim: MAX_IMAGE_DIMENSION || 1400, 
      quality: IMAGE_QUALITY || 0.8 
    });
  });
}