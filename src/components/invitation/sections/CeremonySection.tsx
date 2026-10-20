import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { LocalizedDate } from "../../common/LocalizedDate";
import { EventDetailItem } from "../../../types";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] as const } }
};

export interface CeremonySectionProps {
  copy?: Record<string, string>;
  eventDetails?: EventDetailItem[];
  invitation?: { weddingDate?: string };
}

export const CeremonySection = memo(function CeremonySection({ copy, eventDetails, invitation }: CeremonySectionProps) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const events = Array.isArray(eventDetails) ? eventDetails : [];
  const weddingDate = invitation?.weddingDate || "2026-08-22T19:00:00";

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card ceremony-card">
      <p className="section-label">{isEn ? t('invitation.ceremonyLabel') : copy?.ceremonyLabel}</p>
      <h2>{isEn ? t('invitation.ceremonyTitle') : copy?.ceremonyTitle}</h2>
      
      <div className="ceremony-date" style={{ textAlign: "center", marginBottom: "20px", fontWeight: "bold" }}>
        <LocalizedDate dateString={weddingDate} />
      </div>

      <div className="ceremony-grid">
        {events.map((event, index) => (
          <div className="ceremony-item" key={`${event.label}-${index}`}>
            <span>{event.label}</span>
            <strong>{event.time}</strong>
            <p>{event.description}</p>
            <em>{event.location}</em>
          </div>
        ))}
      </div>
    </m.section>
  );
});