import React, { memo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { m, useScroll, useTransform, useSpring } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export const StorySection = memo(function StorySection({ copy, storyTimeline }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const stories = Array.isArray(storyTimeline) ? storyTimeline : [];
  
  // Animasyonlar için container'ı dinliyoruz
  const containerRef = useRef(null);
  
  // Kaydırma (Scroll) oranını al: Container ekranın ortasına gelince 0, ortasından çıkarken 1 olur.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // İlerleme çubuğuna yay (spring) efekti veriyoruz ki akıcı ve esnek dolsun
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Konum (Pin) ikonunun yukarıdan aşağıya doğru izleyeceği Y ekseni
  const travelerY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (stories.length === 0) return null;

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="card story-card">
      <p className="section-label">{isEn ? t('invitation.storyLabel') : copy?.storyLabel}</p>
      <h2>{isEn ? t('invitation.storyTitle') : copy?.storyTitle}</h2>
      
      <div className="story-timeline-container" ref={containerRef}>
        {/* Arka plandaki kesik kesik harita yolu */}
        <div className="story-line-bg"></div>
        
        {/* Scroll ile birlikte aşağı doğru akan renkli rota */}
        <m.div className="story-line-progress" style={{ scaleY }}></m.div>

        {/* Scroll ile birlikte rota üzerinde seyahat eden Konum İkonu */}
        <m.div className="story-traveler" style={{ top: travelerY }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--rose-dark)" }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </m.div>

        {/* Hikaye Noktaları (Duraklar) */}
        {stories.map((story, index) => (
          <m.div 
            initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.7, delay: 0.1, type: "spring", bounce: 0.4 }} 
            viewport={{ once: true, amount: 0.4 }}
            className={`story-node ${index % 2 === 0 ? 'left' : 'right'}`} 
            key={index}
          >
            {/* Nokta (Durak) İşareti */}
            <div className="story-map-marker">
              <div className="story-map-marker-inner"></div>
            </div>
            
            {/* İçerik Kutusu */}
            <div className="story-content-box">
              <span className="story-date">{story.date}</span>
              <h3 className="story-heading">{story.title}</h3>
              <p className="story-desc">{story.description}</p>
              {story.image && (
                <img src={story.image} alt={story.title} className="story-image" loading="lazy" />
              )}
            </div>
          </m.div>
        ))}
      </div>
    </m.section>
  );
});