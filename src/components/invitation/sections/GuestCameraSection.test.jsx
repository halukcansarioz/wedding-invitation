import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GuestCameraSection } from './GuestCameraSection';
import { useStore } from '../../../store/useStore';
import * as dbServices from '../../../services/database';

vi.mock('../../../store/useStore');
// loadStoredSiteData modülünün eksik olmasını önlüyoruz
vi.mock('../../../utils/helpers', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, triggerConfetti: vi.fn(), loadStoredSiteData: vi.fn().mockReturnValue({}) };
});
vi.mock('../../../services/database', () => ({ uploadAndModerateGuestPhoto: vi.fn() }));
vi.mock('framer-motion', () => ({ m: { section: ({ children }) => <section>{children}</section> } }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } }) }));

describe('GuestCameraSection Bileşen Testleri', () => {
  let mockShowAppAlert;

  beforeEach(() => {
    vi.clearAllMocks();
    mockShowAppAlert = vi.fn();
    useStore.mockImplementation((selector) => selector({
      showAppAlert: mockShowAppAlert,
      siteData: { invitation: { bride: "Test", groom: "Çift", dateText: "1 Ocak" } }
    }));

    global.Image = class { constructor() { setTimeout(() => { if (this.onload) this.onload(); }, 10); } };
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage: vi.fn(), createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })), fillRect: vi.fn(), fillText: vi.fn() }));
    HTMLCanvasElement.prototype.toBlob = vi.fn((cb) => cb(new Blob()));
    window.URL.createObjectURL = vi.fn();
  });

  it('Fotoğraf yüklendiğinde başarılı ise konfeti patlatmalı', async () => {
    dbServices.uploadAndModerateGuestPhoto.mockResolvedValue({ url: 'test.jpg', isApproved: true });
    render(<GuestCameraSection />);
    
    const fileInput = document.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' })] } });

    await waitFor(() => {
      expect(mockShowAppAlert).toHaveBeenCalledWith(expect.stringContaining('Harika!'), expect.objectContaining({ tone: 'success' }));
    });
  });
});