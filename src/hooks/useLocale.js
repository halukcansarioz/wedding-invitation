import { useTranslation } from "react-i18next";

export function useLocale() {
  const { t, i18n } = useTranslation();
  
  // Dil ingilizce mi kontrolünü tek bir merkeze alıyoruz
  const isEn = i18n.language?.startsWith('en') || false;
  
  // İleride dil değiştirme fonksiyonunu da buraya entegre edebilirsiniz
  const toggleLanguage = () => {
    i18n.changeLanguage(isEn ? 'tr' : 'en');
  };

  return { t, i18n, isEn, toggleLanguage };
}