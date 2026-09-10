self.onmessage = async function(e) {
  const { file, maxDim, quality } = e.data;
  
  if (!self.createImageBitmap || !self.OffscreenCanvas) {
    self.postMessage({ error: "OffscreenCanvas not supported", file });
    return;
  }

  try {
    const bitmap = await createImageBitmap(file);
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
    self.postMessage({ error: error.message, file });
  }
};