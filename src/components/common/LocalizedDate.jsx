import React from 'react';
import { useTranslation } from 'react-i18next';

export const LocalizedDate = ({ dateString = "2026-08-22T19:00:00" }) => {
  const { i18n } = useTranslation();
  const date = new Date(dateString);
  
  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  }).format(date);

  return <span>{formattedDate}</span>;
};