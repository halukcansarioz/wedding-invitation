self.onmessage = async function(e) {
  const { file, maxDim, quality } = e.data;
  let processBlob = file;
  
  try {
    // SADECE dosya HEIC ise kütüphaneyi indir ve çalıştır (Paket boyutunu devasa oranda küçültür)
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: quality });
      processBlob = Array.isArray(converted) ? converted[0] : converted;
    }

    if (!self.createImageBitmap || !self.OffscreenCanvas) {
      self.postMessage({ error: "OffscreenCanvas not supported", file: processBlob });
      return;
    }

    const bitmap = await createImageBitmap(processBlob);
    let { width, height } = bitmap;

    if (width > maxDim || height > maxDim) {
      if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; } 
      else { width = Math.round((width * maxDim) / height); height = maxDim; }
    }

    const canvas = new OffscreenCanvas(width, height);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);

    const blob = await canvas.convertToBlob({ type: "image/webp", quality: quality });
    self.postMessage({ blob });
  } catch (error) {
    self.postMessage({ error: error.message, file: processBlob });
  }
};