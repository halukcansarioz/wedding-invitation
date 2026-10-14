import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WishesSection } from './WishesSection';

// Çeviri mock'u: t() fonksiyonu kendisine verilen metni aynen döndürür
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'tr' } })
}));

// Ses kaydedici hook'unu kontrol edilebilir şekilde mockluyoruz
const mockStartRecording = vi.fn();
const mockStopRecording = vi.fn();

vi.mock('../../../hooks/useAudioRecorder', () => ({
  useAudioRecorder: () => ({
    isRecording: false,
    recordingTime: 0,
    startRecording: mockStartRecording,
    stopRecording: mockStopRecording,
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

  it('Ses kaydı butonuna tıklandığında startRecording tetiklenmeli', async () => {
    render(<WishesSection submitWish={vi.fn()} />);

    // Kayıt başlatma butonunu bul (Mikrofon ikonlu buton)
    const micButton = screen.getByRole('button', { name: /🎤/i });
    fireEvent.click(micButton);

    expect(mockStartRecording).toHaveBeenCalledTimes(1);
  });
});