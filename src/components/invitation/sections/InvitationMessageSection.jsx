import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export const InvitationMessageSection = memo(function InvitationMessageSection({ copy, invitation }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="card invitation-card">
      <p className="section-label">{isEn ? t('invitation.invitationLabel') : copy?.invitationLabel}</p>
      <h2>{isEn ? t('invitation.invitationTitle') : copy?.invitationTitle}</h2>
      <p>{invitation?.message}</p>
    </motion.section>
  );
});