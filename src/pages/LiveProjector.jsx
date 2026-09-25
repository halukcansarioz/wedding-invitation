import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { m, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useWishesQuery } from '../hooks/useWishesQuery';
import { useStore } from '../store/useStore';

export default function LiveProjector() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  
  const siteData = useStore(state => state.siteData);
  const coupleName = `${siteData?.invitation?.bride || "Gelin"} & ${siteData?.invitation?.groom || "Damat"}`;
  
  const { wishes } = useWishesQuery();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const channel = supabase
      .channel('public:wishes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes', filter: 'approved=eq.true' }, () => {
          queryClient.invalidateQueries({ queryKey: ['wishes'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  useEffect(() => {
    if (!wishes || wishes.length === 0) return;
    const interval = setInterval(() => { setCurrentIndex((prev) => (prev + 1) % wishes.length); }, 8000);
    return () => clearInterval(interval);
  }, [wishes]);

  useEffect(() => {
    document.documentElement.dataset.theme = "dark";
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const activeWish = wishes[currentIndex];

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(159, 79, 104, 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(200, 150, 80, 0.1) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>

      <h1 style={{ color: '#fff', fontSize: '3rem', fontFamily: '"Playfair Display", serif', marginBottom: '10px', textShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 10 }}>
        {coupleName}
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '60px', zIndex: 10 }}>
        {isEn ? "Live Guestbook" : "Canlı Anı Defteri"}
      </p>

      <div style={{ width: '80%', maxWidth: '900px', minHeight: '300px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {activeWish ? (
            <m.div
              key={activeWish.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center', width: '100%' }}
            >
              <p style={{ color: '#fff', fontSize: '2.5rem', lineHeight: '1.4', fontStyle: 'italic', fontWeight: '300', marginBottom: activeWish.message_translated ? '15px' : '30px' }}>
                "{activeWish.message}"
              </p>
              
              {/* SİNEMATİK AI ALTYAZISI */}
              {activeWish.message_translated && (
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1.3rem', lineHeight: '1.4', fontStyle: 'italic', marginBottom: '30px', fontWeight: '300' }}>
                  ({activeWish.message_translated})
                </p>
              )}

              <strong style={{ color: 'var(--gold, #c5a461)', fontSize: '1.5rem', letterSpacing: '2px', fontWeight: '600', display: 'inline-block' }}>
                — {activeWish.name}
              </strong>
            </m.div>
          ) : (
            <m.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ color: '#fff', fontSize: '1.5rem' }}>
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