import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShareSection } from './ShareSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('ShareSection Bileşen Testleri', () => {
  let mockCopyLink;
  let originalShare; // DÜZELTİLDİ

  beforeEach(() => {
    mockCopyLink = vi.fn();
    originalShare = navigator.share; // Orijinal halini tut
  });

  afterEach(() => {
    navigator.share = originalShare; // DÜZELTİLDİ: Sızıntı engellendi
    cleanup();
    vi.clearAllMocks();
  });

  it('Cihaz Web Share API desteklemiyorsa (navigator.share yoksa) kopyalama fonksiyonuna (fallback) düşmeli', async () => {
    delete navigator.share;

    render(<ShareSection copyInvitationLink={mockCopyLink} shareText="Davetiye" />);
    
    const shareButton = screen.getByRole('button', { name: /Davetiyeyi Paylaş/i });
    fireEvent.click(shareButton);

    expect(mockCopyLink).toHaveBeenCalledTimes(1);
  });

  it('Cihaz Web Share API destekliyorsa native paylaşım menüsünü tetiklemeli', async () => {
    navigator.share = vi.fn().mockResolvedValue(true);

    render(<ShareSection copyInvitationLink={mockCopyLink} copy={{ shareTitle: "Düğün", shareDescription: "Bekleriz" }} />);
    
    const shareButton = screen.getByRole('button', { name: /Davetiyeyi Paylaş/i });
    fireEvent.click(shareButton);

    expect(navigator.share).toHaveBeenCalledWith(expect.objectContaining({
      title: "Düğün",
      text: "Bekleriz"
    }));
    
    expect(mockCopyLink).not.toHaveBeenCalled();
  });
});