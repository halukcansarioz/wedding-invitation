import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FamilyTab } from './FamilyTab';
import { useStore } from '../../../store/useStore';

describe('FamilyTab Admin Bileşen Testleri', () => {
  let initialState;

  beforeEach(() => {
    initialState = useStore.getState();
    useStore.setState({
      adminDraft: {
        settings: { visibility: { family: true } },
        familyInfo: {
          brideFamilyTitle: "Gelin Ailesi",
          brideFamilyName: "Yılmaz Ailesi",
          groomFamilyTitle: "Damat Ailesi",
          groomFamilyName: "Demir Ailesi",
          text: "Sizleri aramızda görmekten mutluluk duyarız."
        }
      }
    });
  });

  afterEach(() => {
    cleanup();
    useStore.setState(initialState, true);
    vi.clearAllMocks();
  });

  it('Zustand store üzerindeki aile bilgilerini inputlarda göstermeli', () => {
    render(<FamilyTab isEn={false} />);
    
    expect(screen.getByDisplayValue('Yılmaz Ailesi')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Demir Ailesi')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sizleri aramızda görmekten mutluluk duyarız.')).toBeInTheDocument();
  });

  it('Gelin ailesi ismi güncellendiğinde store güncellenmeli', () => {
    render(<FamilyTab isEn={false} />);
    
    const brideFamilyInput = screen.getByDisplayValue('Yılmaz Ailesi');
    fireEvent.change(brideFamilyInput, { target: { value: 'Yılmaz & Kaya Ailesi' } });

    expect(useStore.getState().adminDraft.familyInfo.brideFamilyName).toBe('Yılmaz & Kaya Ailesi');
  });
});