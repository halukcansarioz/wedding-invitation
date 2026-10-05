import React, { useState, useRef, memo } from "react";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { uploadAndModerateGuestPhoto } from "../../../services/database";
import { useStore } from "../../../store/useStore";
import { triggerConfetti } from "../../../utils/helpers";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export const GuestCameraSection = memo(function GuestCameraSection() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const showAppAlert = useStore((state) => state.showAppAlert);
  const siteData = useStore((state) => state.siteData);
  
  const coupleName = `${siteData?.invitation?.bride || "Gelin"} & ${siteData?.invitation?.groom || "Damat"}`;
  const dateText = siteData?.invitation?.dateText || "";

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Filigran / Çerçeve Basma Fonksiyonu (Sıkıştırma Optimizasyonlu)
  const applyPhotoboothFilter = (originalFile) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(originalFile);
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Maksimum çözünürlük sınırı (Full HD)
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1920;
        let width = img.width;
        let height = img.height;

        // En-boy oranını koruyarak yeniden boyutlandırma
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height *= MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width *= MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Orijinal Fotoğrafı yeniden boyutlandırarak çiz
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Dinamik Gradient Yüksekliği (Ekranın %15'i kadar)
        const gradientHeight = Math.floor(canvas.height * 0.15);
        const gradientY = canvas.height - gradientHeight;
        
        const gradient = ctx.createLinearGradient(0, gradientY, 0, canvas.height);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(1, "rgba(0,0,0,0.7)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, gradientY, canvas.width, gradientHeight);

        // Çiftin İsmi (Responsive Font)
        const fontSizeTitle = Math.floor(canvas.width * 0.05);
        ctx.font = `bold ${fontSizeTitle}px serif`;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(coupleName, canvas.width / 2, canvas.height - Math.floor(gradientHeight * 0.4));
        
        // Tarih (Responsive Font)
        const fontSizeDate = Math.floor(canvas.width * 0.025);
        ctx.font = `${fontSizeDate}px sans-serif`;
        ctx.fillStyle = "#f1c40f"; 
        ctx.fillText(dateText, canvas.width / 2, canvas.height - Math.floor(gradientHeight * 0.15));

        // %85 kalite ile JPEG formatında Blob'a çevir
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error("Canvas conversion failed")); return; }
          resolve(new File([blob], `photobooth_${Date.now()}.jpg`, { type: "image/jpeg" }));
        }, "image/jpeg", 0.85);
      };
      img.onerror = reject;
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      showAppAlert(isEn ? "Applying wedding frame..." : "Düğün çerçevesi uygulanıyor...", { title: "Fotoğraf Kabini" });
      
      // Fotoğrafa filigran bas (Ve Sıkıştır)
      const watermarkedFile = await applyPhotoboothFilter(file);

      showAppAlert(isEn ? "Uploading to shared album..." : "Ortak albüme yükleniyor...", { title: "Yükleniyor" });
      const { isApproved } = await uploadAndModerateGuestPhoto(watermarkedFile);
      
      if (isApproved) {
        triggerConfetti();
        showAppAlert(isEn ? "Awesome! Your photo is added to the gallery." : "Harika! Çerçeveli fotoğrafınız galeriye eklendi.", { tone: "success" });
      } else {
        showAppAlert(isEn ? "Photo received. It will be published after admin review." : "Fotoğraf alındı. Gelin ve damat onayından sonra yayınlanacak.", { tone: "info" });
      }
    } catch (error) {
      showAppAlert(isEn ? "Could not process photo." : "Fotoğraf işlenemedi. Lütfen tekrar deneyin.", { tone: "error", title: "Hata" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card">
      <p className="section-label">{isEn ? "AR Photobooth" : "Dijital Fotoğraf Kabini"}</p>
      <h2>{isEn ? "Share Your Memories" : "Anılarınızı Paylaşın"}</h2>
      <p>
        {isEn 
          ? "Take a photo right now! We will automatically add our wedding frame and put it in the shared album." 
          : "Şu an bir fotoğraf çekin! Düğün çerçevenizi otomatik olarak ekleyip dev ekrana ve ortak albümümüze yollayalım."}
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
        <input 
          data-testid="camera-input"
          type="file" 
          accept="image/*" 
          capture="environment"
          ref={fileInputRef} 
          style={{ display: "none" }} 
          onChange={handleFileSelect} 
        />
        <button 
          type="button" 
          className="main-button" 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isUploading}
          style={{ padding: "16px 32px", fontSize: "16px", background: "linear-gradient(135deg, #e67e22, #d35400)", borderColor: "#d35400" }}
        >
          📸 {isUploading ? (isEn ? "Processing..." : "İşleniyor & Yükleniyor...") : (isEn ? "Open Camera" : "Kamera / Galeri Aç")}
        </button>
      </div>
    </m.section>
  );
});