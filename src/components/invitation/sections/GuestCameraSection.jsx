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
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { isApproved } = await uploadAndModerateGuestPhoto(file);
      
      if (isApproved) {
        triggerConfetti();
        showAppAlert(isEn ? "Awesome! Your photo is added to the gallery." : "Harika! Fotoğrafınız galeriye eklendi.", { tone: "success" });
      } else {
        showAppAlert(isEn ? "Photo received. It will be published after admin review." : "Fotoğraf alındı. Gelin ve damat onayından sonra yayınlanacak.", { tone: "info" });
      }
    } catch (error) {
      showAppAlert(isEn ? "Could not upload photo." : "Fotoğraf yüklenemedi. Lütfen tekrar deneyin.", { tone: "error", title: "Hata" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card">
      <p className="section-label">{isEn ? "Guest POV" : "Misafir Gözünden"}</p>
      <h2>{isEn ? "Share Your Memories" : "Anılarınızı Paylaşın"}</h2>
      <p>
        {isEn 
          ? "Take a photo right now or choose from your gallery to add it to our shared digital album!" 
          : "Şu an bir fotoğraf çekerek veya galerinizden seçerek ortak dijital albümümüze anında katkıda bulunun!"}
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
        <input 
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
          style={{ padding: "16px 32px", fontSize: "16px" }}
        >
          📸 {isUploading ? (isEn ? "Analyzing AI & Uploading..." : "Yapay Zeka Tarıyor & Yükleniyor...") : (isEn ? "Open Camera / Gallery" : "Kamera / Galeri Aç")}
        </button>
      </div>
    </m.section>
  );
});