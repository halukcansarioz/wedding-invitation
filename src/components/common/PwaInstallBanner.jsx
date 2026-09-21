import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export function PwaInstallBanner() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en') || false;
  const { isInstallable, isIos, promptInstall, setIsInstallable } = usePWAInstall();

  if (!isInstallable) return null;

  if (isIos) {
    return (
      <div className="pwa-banner-wrapper ios-pwa-banner">
        <span className="pwa-banner-text">
          {isEn ? "📱 Tap 'Share' icon then 'Add to Home Screen'" : "📱 Kolay erişim için 'Paylaş' ikonuna basıp 'Ana Ekrana Ekle'yi seçin"}
        </span>
        <button onClick={() => setIsInstallable(false)} className="secondary-button pwa-banner-btn" style={{ minWidth: 'auto', padding: '4px 12px' }}>
          ✕
        </button>
      </div>
    );
  }

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