import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { WishesSection } from './WishesSection';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';

vi.mock('../../../hooks/useAudioRecorder');

// KRİTİK DÜZELTME 1: Butonun varsayılan submit davranışını önlemek için type="button" eklendi
vi.mock('@marsidev/react-turnstile', () => ({ 
  Turnstile: ({ onSuccess }: any) => (
    <button type="button" data-testid="turnstile-btn" onClick={() => onSuccess('valid-token')}>
      Token Al
    </button>
  )
}));

vi.mock('react-i18next', () => ({ 
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'tr' } }) 
}));

// KRİTİK DÜZELTME 2: Canvas kullanan triggerConfetti fonksiyonunun JSDOM ortamında (clearRect okuyamadığı için) çökmesini engeller
vi.mock('../../../utils/helpers', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    triggerConfetti: vi.fn()
  };
});

describe('WishesSection Form Validasyon ve Gönderim Testleri', () => {
  const mockSubmitWish = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    (useAudioRecorder as any).mockReturnValue({
      isRecording: false,
      recordingTime: 0,
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      clearRecording: vi.fn(),
      audioBlob: null,
      uploadAudio: vi.fn()
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('Zorunlu alanlar boş bırakıldığında Zod şeması hata mesajlarını göstermeli ve formu göndermemeli', async () => {
    render(<WishesSection submitWish={mockSubmitWish} approvedWishes={[]} />);
    
    fireEvent.click(screen.getByTestId('turnstile-btn'));
    fireEvent.click(screen.getByRole('button', { name: 'form.submitWish' }));

    await waitFor(() => {
      expect(screen.getByText('form.missingNameMessage')).toBeInTheDocument();
      expect(screen.getByText('form.missingWishMessage')).toBeInTheDocument();
      expect(mockSubmitWish).not.toHaveBeenCalled();
    });
  });

  it('Geçerli veriler girildiğinde submitWish fonksiyonu çağrılmalı ve form sıfırlanmalı', async () => {
    render(<WishesSection submitWish={mockSubmitWish} approvedWishes={[]} />);
    
    fireEvent.change(screen.getByPlaceholderText('form.namePlaceholder'), { target: { value: 'Ahmet Yılmaz' } });
    fireEvent.change(screen.getByPlaceholderText('form.messagePlaceholder'), { target: { value: 'Harika bir düğün, mutluluklar dilerim!' } });
    
    fireEvent.click(screen.getByTestId('turnstile-btn'));
    fireEvent.click(screen.getByRole('button', { name: 'form.submitWish' }));

    await waitFor(() => {
      expect(mockSubmitWish).toHaveBeenCalledTimes(1);
      expect(mockSubmitWish).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Ahmet Yılmaz',
        message: 'Harika bir düğün, mutluluklar dilerim!',
        turnstileToken: 'valid-token'
      }));
    });
  });

  it('Honeypot alanı doldurulursa (Bot saldırısı simülasyonu) gönderim engellenmeli', async () => {
    const { container } = render(<WishesSection submitWish={mockSubmitWish} approvedWishes={[]} />);
    
    const honeypotInput = container.querySelector('input[name="honeypot"]') as HTMLInputElement;
    fireEvent.change(honeypotInput, { target: { value: 'spam-bot-data' } });
    
    fireEvent.change(screen.getByPlaceholderText('form.namePlaceholder'), { target: { value: 'Bot' } });
    fireEvent.change(screen.getByPlaceholderText('form.messagePlaceholder'), { target: { value: 'Spam mesaj' } });
    
    fireEvent.click(screen.getByTestId('turnstile-btn'));
    fireEvent.click(screen.getByRole('button', { name: 'form.submitWish' }));

    await waitFor(() => {
      expect(mockSubmitWish).not.toHaveBeenCalled();
    });
  });
});