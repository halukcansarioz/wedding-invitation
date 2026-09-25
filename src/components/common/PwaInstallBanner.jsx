import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { supabase } from '../../supabaseClient';

// VAPID anahtarınızı ortam değişkenlerinden alıyoruz
const PUBLIC_VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// URL Base64 string'i Uint8Array'e çeviren yardımcı fonksiyon
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeToPushNotifications = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window && PUBLIC_VAPID_KEY) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });

      // Abonelik bilgilerini Supabase veritabanına kaydedin
      await supabase.from('push_subscriptions').insert([
        { sub_data: subscription, created_at: new Date() }
      ]);
      
      console.log("Push bildirimlerine başarıyla abone olundu!");
    } catch (error) {
      console.error("Bildirim izni alınamadı:", error);
    }
  }
};

export function PwaInstallBanner() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en') || false;
  const { isInstallable, isIos, promptInstall, setIsInstallable } = usePWAInstall();

  // YENİ: Hem kurulabilir değilse hem de iOS ise BİLEŞENİ GİZLE (Arkada görünmesini engeller)
  if (!isInstallable || isIos) {
    return null; 
  }

  const handleInstallClick = async () => {
    await promptInstall();
    // Kullanıcı uygulamayı yükleme adımlarını tamamladıktan sonra bildirim izni iste
    subscribeToPushNotifications();
  };

  return (
    <div className="pwa-banner-wrapper">
      <span className="pwa-banner-text">
        {isEn ? "📱 Install App for Easy Access" : "📱 Kolay Erişim İçin Yükle"}
      </span>
      {/* Kurulum butonuna basıldığında hem PWA kurulur hem Push izni istenir */}
      <button onClick={handleInstallClick} className="main-button pwa-banner-btn">
        {isEn ? "Install" : "Yükle"}
      </button>
    </div>
  );
}