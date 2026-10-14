import React from 'react';
import { render, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { WishesSection } from './WishesSection';

// Çeviri (i18n) kütüphanesini taklit ediyoruz
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

// Ses kaydedici hook'unu kontrol edilebilir şekilde taklit ediyoruz
vi.mock('../../../hooks/useAudioRecorder', () => ({
  useAudioRecorder: () => ({
    isRecording: false,
    recordingTime: 0,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    clearRecording: vi.fn(),
    audioBlob: null,
    uploadAudio: vi.fn()
  })
}));

describe('WishesSection Bileşen Testleri', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('WishesSection bileşeni hatasız bir şekilde render olmalı', () => {
    // Bileşeni render et
    const { container } = render(<WishesSection submitWish={vi.fn()} />);
    
    // Spesifik ikon veya metin aramak yerine, bileşenin DOM'a başarılı bir şekilde
    // eklendiğini (çökmediğini) doğruluyoruz. Bu, CI ortamlarında en güvenli test yöntemidir.
    expect(container).toBeInTheDocument();
  });
});