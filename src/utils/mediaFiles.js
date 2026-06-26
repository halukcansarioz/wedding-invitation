import { MAX_IMAGE_DIMENSION, IMAGE_QUALITY, MAX_AUDIO_FILE_SIZE } from "../constants/siteData";

export const readImageFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/")) {
      reject(new Error("Lütfen geçerli bir görsel dosyası seçin."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const originalDataUrl = reader.result;

      if (file.type === "image/svg+xml") {
        resolve(originalDataUrl);
        return;
      }

      const image = new Image();

      image.onload = () => {
        const ratio = Math.min(
          1,
          MAX_IMAGE_DIMENSION / image.naturalWidth,
          MAX_IMAGE_DIMENSION / image.naturalHeight
        );

        const width = Math.max(1, Math.round(image.naturalWidth * ratio));
        const height = Math.max(1, Math.round(image.naturalHeight * ratio));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;

        context.fillStyle = "#fffafb";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
      };

      image.onerror = () => resolve(originalDataUrl);
      image.src = originalDataUrl;
    };

    reader.onerror = () => reject(new Error("Görsel okunamadı."));
    reader.readAsDataURL(file);
  });
};

export const readAudioFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("audio/")) {
      reject(new Error("Lütfen geçerli bir müzik dosyası seçin."));
      return;
    }

    if (file.size > MAX_AUDIO_FILE_SIZE) {
      reject(new Error("Müzik dosyası çok büyük. Lütfen 4 MB altında bir MP3/M4A dosyası seçin."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        dataUrl: reader.result,
        name: file.name || "Yüklenen müzik",
      });
    };

    reader.onerror = () => reject(new Error("Müzik dosyası okunamadı."));
    reader.readAsDataURL(file);
  });
};
