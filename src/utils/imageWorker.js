self.onmessage = async (e) => {
  const { file, maxWidth = 1920, quality = 0.8 } = e.data;

  try {
    if (typeof createImageBitmap === 'undefined' || typeof OffscreenCanvas === 'undefined') {
      self.postMessage({ success: false, fallback: true });
      return;
    }

    const bitmap = await createImageBitmap(file);
    let width = bitmap.width;
    let height = bitmap.height;

    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await canvas.convertToBlob({ type: 'image/webp', quality });
    self.postMessage({ success: true, blob });
  } catch (error) {
    self.postMessage({ success: false, error: error.message, fallback: true });
  }
};