import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FamilyTab } from './FamilyTab';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useStore');

describe('FamilyTab Admin Bileşen Testleri', () => {
  let mockUpdateDraftObject;

  beforeEach(() => {
    mockUpdateDraftObject = vi.fn();

    useStore.mockImplementation((selector) => selector({
      adminDraft: {
        settings: { visibility: { family: true } },
        familyInfo: {
          brideFamilyTitle: "Gelin Ailesi",
          brideFamilyName: "Yılmaz Ailesi",
          groomFamilyTitle: "Damat Ailesi",
          groomFamilyName: "Demir Ailesi",
          text: "Sizleri aramızda görmekten mutluluk duyarız."
        }
      },
      updateDraftObject: mockUpdateDraftObject,
      saveSiteContent: vi.fn()
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Zustand store üzerindeki aile bilgilerini inputlarda göstermeli', () => {
    render(<FamilyTab isEn={false} />);
    
    expect(screen.getByDisplayValue('Yılmaz Ailesi')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Demir Ailesi')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sizleri aramızda görmekten mutluluk duyarız.')).toBeInTheDocument();
  });

  it('Gelin ailesi ismi güncellendiğinde ilgili fonksiyon çağrılmalı', () => {
    render(<FamilyTab isEn={false} />);
    
    const brideFamilyInput = screen.getByDisplayValue('Yılmaz Ailesi');
    fireEvent.change(brideFamilyInput, { target: { value: 'Yılmaz & Kaya Ailesi' } });

    expect(mockUpdateDraftObject).toHaveBeenCalledWith('familyInfo', 'brideFamilyName', 'Yılmaz & Kaya Ailesi');
  });
});