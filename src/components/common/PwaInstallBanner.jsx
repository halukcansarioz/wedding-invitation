import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePWAInstall } from '../../hooks/usePWAInstall';

// RsvpSection.jsx'in beklediği (eksik olan) Push Bildirim Abonelik fonksiyonu
export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    
    // Eğer mevcut bir abonelik yoksa yeni oluştur
    if (!subscription) {
      const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) return null;
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicVapidKey
      });
    }
    return subscription;
  } catch (error) {
    console.warn('Push bildirimlerine abone olunamadı:', error);
    return null;
  }
};

export const PwaInstallBanner = () => {
  const { isInstallable, isIos, promptInstall } = usePWAInstall();
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith('en');

  if (!isInstallable) return null;

  if (isIos) {
    // iOS için banner'ı gizlemek yerine Apple'ın Paylaş / Ekle navigasyonunu anlatan tooltip
    return (
      <div className="pwa-install-banner ios-banner" style={{
        position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', 
        background: 'var(--paper)', padding: '12px 24px', borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999, textAlign: 'center',
        border: '1px solid var(--admin-border-color)'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-main)', fontWeight: 'bold' }}>
          {isEn 
            ? "📱 Tap 'Share' then 'Add to Home Screen' for the best experience!" 
            : "📱 Kolay Erişim İçin: 'Paylaş' ikonuna basıp 'Ana Ekrana Ekle'yi seçin!"}
        </p>
      </div>
    );
  }

  return (
    <div className="pwa-install-banner" style={{
        position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', 
        background: 'var(--paper)', padding: '12px 24px', borderRadius: '12px', display: 'flex',
        alignItems: 'center', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999,
        border: '1px solid var(--admin-border-color)'
    }}>
      <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 'bold' }}>
        {isEn ? "📱 Install App for Easy Access" : "📱 Kolay Erişim İçin Yükle"}
      </span>
      <button type="button" onClick={promptInstall} className="main-button" style={{ padding: '8px 16px', margin: 0 }}>
        {isEn ? "Install" : "Yükle"}
      </button>
    </div>
  );
};