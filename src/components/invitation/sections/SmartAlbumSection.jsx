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
    
    try {
      const fileName = `temp_selfies/${Date.now()}_selfie.jpg`;
      const { data: uploadData } = await supabase.storage.from("wedding-media").upload(fileName, file);
      
      const { data: publicUrlData } = supabase.storage.from("wedding-media").getPublicUrl(uploadData.path);

      const res = await supabase.functions.invoke('face-match', {
        body: { sourceImageUrl: publicUrlData.publicUrl }
      });

      if (res.data?.matches) {
        setMatchedPhotos(res.data.matches);
      }
      
      await supabase.storage.from("wedding-media").remove([uploadData.path]);
      
    } catch (error) {
      console.error("Yüz tanıma hatası:", error);
      alert(isEn ? "Could not scan photos. Please try again." : "Fotoğraflar taranamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card" style={{ background: "linear-gradient(145deg, #1c141a, #241a21)", color: "#fff", borderColor: "rgba(255,255,255,0.1)" }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>🪄</span>
        <h2 style={{ color: "#fff", marginBottom: "8px" }}>
          {isEn ? "Find Your Photos" : "Kendi Fotoğraflarını Bul"}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "24px", fontSize: "15px" }}>
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
              style={{ padding: "16px 32px", fontSize: "16px", background: "linear-gradient(135deg, #d36a86, #7a203b)", border: "none", color: "#fff" }}
            >
              📷 {isScanning ? (isEn ? "Scanning the Album..." : "Albüm Taranıyor (Yapay Zeka)...") : (isEn ? "Take a Selfie to Search" : "Aramak İçin Selfie Çek")}
            </button>
            {searched && !isScanning && matchedPhotos.length === 0 && (
              <p style={{ marginTop: "16px", color: "#e74c3c" }}>{isEn ? "No matching photos found." : "Maalesef albümde size ait bir kare bulunamadı."}</p>
            )}
          </>
        ) : (
          <div style={{ marginTop: "24px" }}>
            <h3 style={{ color: "var(--gold)", marginBottom: "16px" }}>{isEn ? `Found ${matchedPhotos.length} Photos!` : `${matchedPhotos.length} Fotoğraf Bulundu!`}</h3>
            <div className="gallery-grid">
              {matchedPhotos.map((photoUrl, index) => (
                <a href={photoUrl} download target="_blank" rel="noreferrer" key={index} style={{ display: 'block', textDecoration: 'none' }}>
                  <LazyImage src={photoUrl} alt={`Sizin fotoğrafınız ${index + 1}`} style={{ borderRadius: "8px" }} />
                  <span style={{ display: 'block', marginTop: '8px', fontSize: '12px', color: '#d36a86' }}>📥 {isEn ? "Download HD" : "HD İndir"}</span>
                </a>
              ))}
            </div>
            <button onClick={() => { setSearched(false); setMatchedPhotos([]); }} className="secondary-button" style={{ marginTop: "24px", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
              {isEn ? "Search Again" : "Tekrar Ara"}
            </button>
          </div>
        )}
      </div>
    </m.section>
  );
});