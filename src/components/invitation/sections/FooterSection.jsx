import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }
};

export const FooterSection = memo(function FooterSection({ coupleName, invitation, copy }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  return (
    <motion.footer initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="footer">
      <p>{coupleName}</p>
      <span>{invitation?.dateText}</span>
      <small>{isEn ? t('invitation.thanksText') : copy?.thanksText}</small>
      <small>{isEn ? t('invitation.footerSmall') : copy?.footerSmall}</small>
    </motion.footer>
  );
});