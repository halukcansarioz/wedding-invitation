import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useTranslation } from 'react-i18next';

export function usePaymentFeedback() {
  const showAppAlert = useStore(state => state.showAppAlert);
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success') {
      showAppAlert(
        isEn 
          ? "Your gift has been successfully received. Thank you so much for your support! 💖" 
          : "Hediyeniz başarıyla ulaştı. Desteğiniz için sonsuz teşekkürler! 💖", 
        { tone: "success", title: "Başarılı 🎉" }
      );
      // URL'yi temizle
      window.history.replaceState(null, "", window.location.pathname);
    } else if (paymentStatus === 'cancel') {
      showAppAlert(
        isEn ? "Payment process was cancelled." : "Ödeme işlemi iptal edildi.", 
        { tone: "info", title: "Bilgi" }
      );
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [showAppAlert, isEn]);
}