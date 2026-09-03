import React, { useEffect } from 'react';
import { useContentStore } from '../../../store/useStore';

export default function HeroSection() {
  // Zustand store'dan dil state'ini ve içerikleri çekiyoruz
  const { currentLang, content, fetchContent, setLang } = useContentStore();

  // Bileşen ekrana geldiğinde veya dil değiştiğinde veritabanından güncel metinleri al
  useEffect(() => {
    fetchContent(currentLang);
  }, [currentLang, fetchContent]);

  // Supabase'den veri gelene kadar boş ekran çıkmasını önlemek için bekleme durumu
  if (!content || !content.hero_title) {
    return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>;
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center">
      
      {/* Sağ üst köşeye eklenecek şık bir dil değiştirici */}
      <div className="absolute top-5 right-5 flex gap-2 z-50">
        <button 
          onClick={() => setLang('tr')} 
          className={`px-3 py-1 rounded-full border transition-all ${currentLang === 'tr' ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          TR
        </button>
        <button 
          onClick={() => setLang('en')} 
          className={`px-3 py-1 rounded-full border transition-all ${currentLang === 'en' ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          EN
        </button>
      </div>

      {/* Supabase veritabanından (site_content tablosu) gelen dinamik metinler */}
      <div className="hero-content z-10 px-4">
        
        {/* Örn: "Evleniyoruz!" veya "We are getting married!" */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          {content.hero_title}
        </h1>
        
        {/* Örn: "22 Ağustos 2026'da Fenerbahçe Parkı'nda başlayıp Boğaz manzaralı vapur turuyla devam edecek hikayemize ortak olun..." */}
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
          {content.story_text}
        </p>
        
        <div className="flex items-center justify-center gap-4 mb-10 text-xl">
          <span>⏰ {content.ceremony_time}</span>
        </div>

        <button 
          className="px-8 py-3 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-lg"
          onClick={() => document.getElementById('rsvp-section').scrollIntoView({ behavior: 'smooth' })}
        >
          {content.rsvp_button_text}
        </button>

      </div>
    </section>
  );
}