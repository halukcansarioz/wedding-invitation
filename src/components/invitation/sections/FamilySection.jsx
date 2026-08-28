import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export const FamilySection = memo(function FamilySection({ copy, familyInfo }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card family-card">
      <p className="section-label">{isEn ? t('invitation.familyLabel') : copy?.familyLabel}</p>
      <h2>{isEn ? t('invitation.familyTitle') : copy?.familyTitle}</h2>
      <p>{familyInfo?.text}</p>
      <div className="family-grid">
        <div><span>{familyInfo?.brideFamilyTitle}</span><strong>{familyInfo?.brideFamilyName}</strong></div>
        <div><span>{familyInfo?.groomFamilyTitle}</span><strong>{familyInfo?.groomFamilyName}</strong></div>
      </div>
    </m.section>
  );
});