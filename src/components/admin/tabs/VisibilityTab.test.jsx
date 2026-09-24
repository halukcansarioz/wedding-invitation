import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisibilityTab } from './VisibilityTab';
import { useStore } from '../../../store/useStore';
import { DEFAULT_SITE_DATA } from '../../../config/constants';

// i18next Mock - i18n objesi ve language özelliği eklendi
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ 
    t: (key) => key,
    i18n: { language: 'tr' } // Hatanın çözüldüğü satır
  })
}));

describe('VisibilityTab Bileşeni ve Zustand Entegrasyonu', () => {
  beforeEach(() => {
    // Testten önce mağazayı varsayılan ayarlarla başlat
    useStore.setState({
      adminDraft: { ...DEFAULT_SITE_DATA }
    });
  });

  it('checkbox değiştirildiğinde Zustand adminDraft durumunu güncellemeli', () => {
    render(<VisibilityTab isEn={false} />);
    
    // "visibility.gallery" etiketine sahip checkbox'ı bul
    const galleryCheckbox = screen.getByLabelText('visibility.gallery');
    
    // Varsayılan olarak işaretli (true) olmalı
    expect(galleryCheckbox.checked).toBe(true);
    
    // Tıklayarak işareti kaldır (false yap)
    fireEvent.click(galleryCheckbox);
    
    // Hem ekranda işareti kalkmalı
    expect(galleryCheckbox.checked).toBe(false);
    
    // Hem de Zustand store'daki "gallery" görünürlük ayarı false olmalı
    const currentDraft = useStore.getState().adminDraft;
    expect(currentDraft.settings.visibility.gallery).toBe(false);
  });
});