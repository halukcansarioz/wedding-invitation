import { MAX_IMAGE_DIMENSION, IMAGE_QUALITY } from "../config/constants";

/**
 * Yüklenen görseli maksimum boyutlara göre ölçekler ve WebP formatında sıkıştırır.
 * @param {File} file - Yüklenen görsel dosyası
 * @returns {Promise<File|Blob>} - Optimize edilmiş WebP dosyası
 */
export async function optimizeImage(file) {
  if (!file || !file.type.startsWith("image/")) {
    return file;
  }

  // SVG ve GIF formatlarını dönüştürmeden bırak
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;
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

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, "");
            const optimizedFile = new File([blob], `${cleanName}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          },
          "image/webp",
          IMAGE_QUALITY || 0.8
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}