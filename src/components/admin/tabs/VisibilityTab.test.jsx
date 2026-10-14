import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VisibilityTab } from './VisibilityTab';
import { useStore } from '../../../store/useStore';
import { DEFAULT_SITE_DATA } from '../../../config/constants';

// i18next Mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ 
    t: (key) => key,
    i18n: { language: 'tr' } 
  })
}));

describe('VisibilityTab Bileşeni ve Zustand Entegrasyonu', () => {
  beforeEach(() => {
    // Testten önce mağazayı varsayılan ayarlarla başlat
    useStore.setState({
      adminDraft: JSON.parse(JSON.stringify(DEFAULT_SITE_DATA))
    });
  });

  afterEach(() => {
    cleanup(); // DOM çakışmalarını önlemek için temizlik
    vi.clearAllMocks();
  });

  it('checkbox değiştirildiğinde Zustand adminDraft durumunu güncellemeli', () => {
    render(<VisibilityTab isEn={false} />);
    
    // ÇÖZÜM: Sayfada birden fazla checkbox olduğu için name (etiket) ile spesifik seçiyoruz
    const galleryCheckbox = screen.getByRole('checkbox', { name: 'visibility.gallery' });
    
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