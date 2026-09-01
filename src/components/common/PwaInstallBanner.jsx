import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export function PwaInstallBanner() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en') || false;
  const { isInstallable, promptInstall } = usePWAInstall();

  // Yükleme uygun değilse (veya iOS Safari kullanılıyorsa) hiçbir şey gösterme
  if (!isInstallable) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'var(--paper)',
      border: '1.5px solid var(--rose-dark)',
      padding: '12px 20px',
      borderRadius: '999px',
      boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      zIndex: 99999,
      width: 'max-content',
      maxWidth: '90vw'
    }}>
      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>
        {isEn ? "📱 Install App for Easy Access" : "📱 Kolay Erişim İçin Yükle"}
      </span>
      <button 
        onClick={promptInstall}
        className="main-button" 
        style={{ minHeight: '36px', padding: '8px 16px', margin: 0, fontSize: '13px' }}
      >
        {isEn ? "Install" : "Yükle"}
      </button>
    </div>
  );
}