import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export const ScheduleSection = memo(function ScheduleSection({ copy, invitation, scheduleItems }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');
  const items = Array.isArray(scheduleItems) ? scheduleItems : [];

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card schedule-card">
      <p className="section-label">{isEn ? t('invitation.scheduleLabel') : copy?.scheduleLabel}</p>
      <h2>{invitation?.dateText}</h2>
      <div className="schedule-list">
        {items.map((item, index) => (
          <div className="schedule-item" key={`${item.time}-${index}`}>
            <strong>{item.time}</strong><div><span>{item.title}</span><p>{item.description}</p></div>
          </div>
        ))}
      </div>
    </m.section>
  );
});