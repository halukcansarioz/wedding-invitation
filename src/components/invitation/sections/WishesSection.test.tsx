import React from 'react';
import { render, screen } from '../../../../tests/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { WishesSection } from './WishesSection';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';

vi.mock('../../../hooks/useAudioRecorder');
vi.mock('@marsidev/react-turnstile', () => ({ 
  Turnstile: ({ onSuccess }: any) => <button onClick={() => onSuccess('fake-token')}>Token Al</button> 
}));
vi.mock('react-i18next', () => ({ 
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'tr' } }) 
}));

describe('WishesSection Bileşen Testleri', () => {
  it('Ses kaydı devam ediyorken Durdur (Stop) butonunu göstermeli', () => {
    (useAudioRecorder as any).mockReturnValue({
      isRecording: true, 
      recordingTime: 15, 
      startRecording: vi.fn(), 
      stopRecording: vi.fn(), 
      clearRecording: vi.fn()
    });

    render(<WishesSection submitWish={vi.fn()} approvedWishes={[]} />);
    
    expect(screen.getByRole('button', { name: /Durdur/i })).toBeInTheDocument();
    expect(screen.getByText(/00:15/i)).toBeInTheDocument();
  });
});