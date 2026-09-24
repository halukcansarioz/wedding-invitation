// src/pages/LiveProjector.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { m, AnimatePresence } from 'framer-motion';
import { useWishesQuery } from '../hooks/useWishesQuery';
import { useStore } from '../store/useStore';

export default function LiveProjector() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  
  const siteData = useStore(state => state.siteData);
  const coupleName = `${siteData?.invitation?.bride || "Gelin"} & ${siteData?.invitation?.groom || "Damat"}`;
  
  // React Query ile onaylı mesajları çekiyoruz (Realtime olarak arkada güncellenir)
  const { wishes } = useWishesQuery();
  
  const [currentIndex, setCurrentIndex] = useState(0);

  // Her 8 saniyede bir ekrandaki mesajı sinematik olarak değiştir
  useEffect(() => {
    if (!wishes || wishes.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % wishes.length);
    }, 8000); // 8 saniyede bir döner

    return () => clearInterval(interval);
  }, [wishes]);

  // Sayfayı her zaman tam ekran karanlık modda tut
  useEffect(() => {
    document.documentElement.dataset.theme = "dark";
    document.body.style.overflow = "hidden"; // Scroll'u kapat
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const activeWish = wishes[currentIndex];

  return (
    <div style={{
      width: '100vw', height: '100vh', backgroundColor: '#0a0a0a', 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'center', position: 'relative', overflow: 'hidden'
    }}>
      {/* Sinematik Işık Efektleri */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(159, 79, 104, 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(200, 150, 80, 0.1) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>

      <h1 style={{ color: '#fff', fontSize: '3rem', fontFamily: '"Playfair Display", serif', marginBottom: '10px', textShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 10 }}>
        {coupleName}
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '60px', zIndex: 10 }}>
        {isEn ? "Live Guestbook" : "Canlı Anı Defteri"}
      </p>

      <div style={{ width: '80%', maxWidth: '900px', height: '300px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {activeWish ? (
            <m.div
              key={activeWish.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center' }}
            >
              <p style={{ color: '#fff', fontSize: '2.5rem', lineHeight: '1.4', fontStyle: 'italic', fontWeight: '300', marginBottom: '30px' }}>
                "{activeWish.message}"
              </p>
              <strong style={{ color: 'var(--gold, #c5a461)', fontSize: '1.5rem', letterSpacing: '2px', fontWeight: '600' }}>
                — {activeWish.name}
              </strong>
            </m.div>
          ) : (
            <m.p 
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} 
              style={{ color: '#fff', fontSize: '1.5rem' }}
            >
              {isEn ? "Waiting for the first message..." : "İlk mesaj bekleniyor..."}
            </m.p>
          )}
        </AnimatePresence>
      </div>
      
      <div style={{ position: 'absolute', bottom: '40px', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', zIndex: 10 }}>
        {isEn ? "Scan the QR code on your table to send a message to the screen!" : "Ekrana mesaj göndermek için masanızdaki QR kodu okutun!"}
      </div>
    </div>
  );
}