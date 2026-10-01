import React, { useState, useRef, memo } from "react";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { supabase } from "../../../supabaseClient";
import { LazyImage } from "../../common/LazyImage";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export const SmartAlbumSection = memo(function SmartAlbumSection() {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  
  const [isScanning, setIsScanning] = useState(false);
  const [matchedPhotos, setMatchedPhotos] = useState([]);
  const [searched, setSearched] = useState(false);
  const fileInputRef = useRef(null);

  const handleSelfieSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setSearched(true);
    let uploadedPath = null;
    
    try {
      const fileName = `temp_selfies/${Date.now()}_selfie.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from("wedding-media").upload(fileName, file);
      
      if (uploadError) throw uploadError;
      uploadedPath = uploadData.path;
      
      const { data: publicUrlData } = supabase.storage.from("wedding-media").getPublicUrl(uploadedPath);

      const res = await supabase.functions.invoke('face-match', {
        body: { sourceImageUrl: publicUrlData.publicUrl }
      });

      if (res.data?.matches) {
        setMatchedPhotos(res.data.matches);
      }
      
    } catch (error) {
      console.error("Yüz tanıma hatası:", error);
      alert(isEn ? "Could not scan photos. Please try again." : "Fotoğraflar taranamadı. Lütfen tekrar deneyin.");
    } finally {
      // GC: Hata alınsa da alınmasa da yüklenen geçici dosyayı temizle
      if (uploadedPath) {
        await supabase.storage.from("wedding-media").remove([uploadedPath]).catch(err => console.error("Çöp toplama hatası:", err));
      }
      setIsScanning(false);
    }
  };

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card smart-album-card">
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>✨</span>
        <h2 style={{ marginBottom: "8px" }}>
          {isEn ? "Find Your Photos" : "Kendi Fotoğraflarını Bul"}
        </h2>
        <p style={{ marginBottom: "24px", fontSize: "15px" }}>
          {isEn 
            ? "Take a quick selfie, and our AI will instantly find all professional photos you appear in from the wedding night!" 
            : "Hemen bir selfie çek, yapay zeka düğün gecesine ait binlerce profesyonel kare arasından sadece senin olduğun fotoğrafları bulup getirsin!"}
        </p>

        {!searched || matchedPhotos.length === 0 ? (
          <>
            <input 
              type="file" 
              accept="image/*" 
              capture="user" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              onChange={handleSelfieSelect} 
            />
            <button 
              type="button" 
              className="main-button" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isScanning}
              style={{ padding: "16px 32px", fontSize: "16px" }}
            >
              📷 {isScanning ? (isEn ? "Scanning the Album..." : "Albüm Taranıyor (Yapay Zeka)...") : (isEn ? "Take a Selfie to Search" : "Aramak İçin Selfie Çek")}
            </button>
            {searched && !isScanning && matchedPhotos.length === 0 && (
              <p style={{ marginTop: "16px", color: "var(--btn-danger-bg)" }}>{isEn ? "No matching photos found." : "Maalesef albümde size ait bir kare bulunamadı."}</p>
            )}
          </>
        ) : (
          <div style={{ marginTop: "24px" }}>
            <h3 style={{ color: "var(--rose-dark)", marginBottom: "16px" }}>{isEn ? `Found ${matchedPhotos.length} Photos!` : `${matchedPhotos.length} Fotoğraf Bulundu!`}</h3>
            <div className="gallery-grid">
              {matchedPhotos.map((photoUrl, index) => (
                <a href={photoUrl} download target="_blank" rel="noreferrer" key={index} style={{ display: 'block', textDecoration: 'none' }}>
                  <LazyImage src={photoUrl} alt={`Sizin fotoğrafınız ${index + 1}`} style={{ borderRadius: "8px" }} />
                  <span style={{ display: 'block', marginTop: '8px', fontSize: '12px', color: 'var(--rose-dark)', fontWeight: 'bold' }}>📥 {isEn ? "Download HD" : "HD İndir"}</span>
                </a>
              ))}
            </div>
            <button onClick={() => { setSearched(false); setMatchedPhotos([]); }} className="secondary-button" style={{ marginTop: "24px" }}>
              {isEn ? "Search Again" : "Tekrar Ara"}
            </button>
          </div>
        )}
      </div>
    </m.section>
  );
});