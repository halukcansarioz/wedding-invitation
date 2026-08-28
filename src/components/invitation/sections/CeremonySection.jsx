import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export const CeremonySection = memo(function CeremonySection({ copy, eventDetails }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const events = Array.isArray(eventDetails) ? eventDetails : [];

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card ceremony-card">
      <p className="section-label">{isEn ? t('invitation.ceremonyLabel') : copy?.ceremonyLabel}</p>
      <h2>{isEn ? t('invitation.ceremonyTitle') : copy?.ceremonyTitle}</h2>
      <div className="ceremony-grid">
        {events.map((event, index) => (
          <div className="ceremony-item" key={`${event.label}-${index}`}>
            <span>{event.label}</span><strong>{event.time}</strong><p>{event.description}</p><em>{event.location}</em>
          </div>
        ))}
      </div>
    </motion.section>
  );
});