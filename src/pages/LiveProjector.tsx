import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { m, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useWishesQuery } from '../hooks/useWishesQuery';
import { useGuestPhotosQuery } from '../hooks/useGuestPhotosQuery';
import { useStore } from '../store/useStore';
import { LazyImage } from '../components/common/LazyImage';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

function LiveProjectorContent() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  
  const siteData = useStore(state => state.siteData);
  const coupleName = `${siteData?.invitation?.bride || "Gelin"} & ${siteData?.invitation?.groom || "Damat"}`;
  
  const { wishes } = useWishesQuery();
  const { photos } = useGuestPhotosQuery();
  const queryClient = useQueryClient();
  
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayItems = useMemo(() => {
    const items: any[] = [];
    wishes?.forEach(w => items.push({ type: 'wish', data: w }));
    photos?.forEach(p => items.push({ type: 'photo', data: p }));
    return items.sort(() => Math.random() - 0.5);
  }, [wishes, photos]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>;
    let isMounted = true;
    const channelName = `public:wishes-${Date.now()}`;

    const setupChannel = () => {
      channel = supabase
        .channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes', filter: 'approved=eq.true' }, () => {
            if (isMounted) queryClient.invalidateQueries({ queryKey: ['wishes'] });
        })
        .subscribe();
    };

    setupChannel();
    
    return () => { 
      isMounted = false;
      if (channel) supabase.removeChannel(channel).catch(console.error);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!displayItems || displayItems.length === 0) return;
    const interval = setInterval(() => { 
        setCurrentIndex((prev) => (prev + 1) % displayItems.length); 
    }, 8000); 
    return () => clearInterval(interval);
  }, [displayItems]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    return () => { 
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const activeItem = displayItems[currentIndex];

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(var(--theme-rgb), 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(200, 150, 80, 0.1) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>

      <h1 style={{ color: '#fff', fontSize: '5rem', fontFamily: 'var(--font-script)', fontWeight: 'normal', marginBottom: '10px', textShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 10 }}>
        {coupleName}
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '40px', zIndex: 10 }}>
        {isEn ? "Live Memories" : "Canlı Anı Akışı"}
      </p>

      <div style={{ width: '80%', maxWidth: '900px', minHeight: '400px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {activeItem ? (
            <m.div
              key={activeItem.type === 'wish' ? activeItem.data.id : activeItem.data.image_url}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              {activeItem.type === 'wish' ? (
                <>
                  <p style={{ color: '#fff', fontSize: '2.5rem', lineHeight: '1.4', fontStyle: 'italic', fontWeight: 300, marginBottom: activeItem.data.message_translated ? '15px' : '30px' }}>
                    "{activeItem.data.message}"
                  </p>
                  {activeItem.data.message_translated && (
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1.3rem', lineHeight: '1.4', fontStyle: 'italic', marginBottom: '30px', fontWeight: 300 }}>
                      ({activeItem.data.message_translated})
                    </p>
                  )}
                  <strong style={{ color: 'var(--gold, #c5a461)', fontSize: '1.5rem', letterSpacing: '2px', fontWeight: 600, display: 'inline-block' }}>
                    — {activeItem.data.name}
                  </strong>
                </>
              ) : (
                <>
                  <div style={{ width: '100%', maxWidth: '600px', height: '400px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                    <LazyImage src={activeItem.data.image_url} alt="Misafir POV" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <strong style={{ color: 'var(--gold, #c5a461)', fontSize: '1.2rem', marginTop: '20px', letterSpacing: '2px', fontWeight: 400 }}>
                    {isEn ? "Guest POV 📸" : "Misafir Kamerasından 📸"}
                  </strong>
                </>
              )}
            </m.div>
          ) : (
            <m.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ color: '#fff', fontSize: '1.5rem' }}>
              {isEn ? "Waiting for memories..." : "Anılar bekleniyor..."}
            </m.p>
          )}
        </AnimatePresence>
      </div>
      
      <div style={{ position: 'absolute', bottom: '40px', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', zIndex: 10 }}>
        {isEn ? "Scan the QR code to send a message or photo!" : "Ekrana mesaj veya fotoğraf göndermek için davetiyedeki formu kullanın!"}
      </div>
    </div>
  );
}

export default function LiveProjector() {
  return (
    <ErrorBoundary>
      <LiveProjectorContent />
    </ErrorBoundary>
  );
}