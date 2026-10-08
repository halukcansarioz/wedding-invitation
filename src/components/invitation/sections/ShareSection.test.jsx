import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShareSection } from './ShareSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('ShareSection Bileşen Testleri', () => {
  let mockCopyLink;

  beforeEach(() => {
    mockCopyLink = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Cihaz Web Share API desteklemiyorsa (navigator.share yoksa) kopyalama fonksiyonuna (fallback) düşmeli', async () => {
    const originalShare = navigator.share;
    delete navigator.share;

    render(<ShareSection copyInvitationLink={mockCopyLink} shareText="Davetiye" />);
    
    const shareButton = screen.getByRole('button', { name: /Davetiyeyi Paylaş/i });
    fireEvent.click(shareButton);

    expect(mockCopyLink).toHaveBeenCalledTimes(1);

    navigator.share = originalShare;
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