import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export function PwaInstallBanner() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en') || false;
  const { isInstallable, promptInstall } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <div className="pwa-banner-wrapper">
      <span className="pwa-banner-text">
        {isEn ? "📱 Install App for Easy Access" : "📱 Kolay Erişim İçin Yükle"}
      </span>
      <button onClick={promptInstall} className="main-button pwa-banner-btn">
        {isEn ? "Install" : "Yükle"}
      </button>
    </div>
  );
}