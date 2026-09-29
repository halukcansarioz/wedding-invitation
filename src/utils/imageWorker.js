import heic2any from "heic2any";

self.onmessage = async function(e) {
  const { file, maxDim, quality } = e.data;
  let processBlob = file;
  
  try {
    // 1. Eğer dosya HEIC/HEIF ise Web Worker içinde arka planda JPEG'e çevrilir
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: quality });
      processBlob = Array.isArray(converted) ? converted[0] : converted;
    }

    if (!self.createImageBitmap || !self.OffscreenCanvas) {
      // Offscreen Canvas desteklenmiyorsa fall-back için raw datayı geri yolluyoruz
      self.postMessage({ error: "OffscreenCanvas not supported", file: processBlob });
      return;
    }

    // 2. Klasik Sıkıştırma (Resize + WebP Dönüşümü)
    const bitmap = await createImageBitmap(processBlob);
    let { width, height } = bitmap;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await canvas.convertToBlob({ type: "image/webp", quality: quality });
    self.postMessage({ blob });
  } catch (error) {
    // Herhangi bir işlem hatasında orijinal dosyayı paslıyoruz
    self.postMessage({ error: error.message, file: processBlob });
  }
};