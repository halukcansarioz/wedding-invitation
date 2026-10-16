import React from 'react';
import { useTranslation } from 'react-i18next';

export const LocalizedDate = ({ dateString = "2026-08-22T19:00:00" }) => {
  const { i18n } = useTranslation();
  const parsedDate = new Date(dateString);
  
  // Geçersiz tarih girilirse uygulamanın çökmesini engelle
  const safeDate = Number.isNaN(parsedDate.getTime()) 
    ? new Date("2026-08-22T19:00:00") 
    : parsedDate;
  
  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  }).format(safeDate);

  return <span>{formattedDate}</span>;
};