import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export const StorySection = memo(function StorySection({ copy, storyTimeline }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const stories = Array.isArray(storyTimeline) ? storyTimeline : [];

  if (stories.length === 0) return null;

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} className="card story-card">
      <p className="section-label">{isEn ? t('invitation.storyLabel') : copy?.storyLabel}</p>
      <h2>{isEn ? t('invitation.storyTitle') : copy?.storyTitle}</h2>
      
      <div className="story-timeline-container">
        <div className="story-line"></div>
        {stories.map((story, index) => (
          <m.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: index * 0.2 }} 
            viewport={{ once: true, amount: 0.3 }}
            className={`story-node ${index % 2 === 0 ? 'left' : 'right'}`} 
            key={index}
          >
            <div className="story-dot"></div>
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