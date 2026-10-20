import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VisibilityTab } from './VisibilityTab';
import { useStore } from '../../../store/useStore';
import { DEFAULT_SITE_DATA } from '../../../config/constants';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ 
    t: (key) => key,
    i18n: { language: 'tr' } 
  })
}));

describe('VisibilityTab Bileşeni ve Zustand Entegrasyonu', () => {
  beforeEach(() => {
    useStore.setState({
      adminDraft: JSON.parse(JSON.stringify(DEFAULT_SITE_DATA))
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('checkbox değiştirildiğinde Zustand adminDraft durumunu güncellemeli', () => {
    render(<VisibilityTab isEn={false} />);
    
    const galleryCheckbox = screen.getByRole('checkbox', { name: 'visibility.gallery' });
    
    expect(galleryCheckbox.checked).toBe(true);
    
    fireEvent.click(galleryCheckbox);
    
    expect(galleryCheckbox.checked).toBe(false);
    
    const currentDraft = useStore.getState().adminDraft;
    expect(currentDraft.settings.visibility.gallery).toBe(false);
  });
});