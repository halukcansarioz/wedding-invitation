import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VisibilityTab } from './VisibilityTab';
import { useStore } from '../../../store/useStore';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'tr' } })
}));

describe('VisibilityTab Bileşen Testleri', () => {
  let initialState;

  beforeEach(() => {
    initialState = useStore.getState();
    useStore.setState({
      adminDraft: {
        settings: { visibility: { family: true, countdown: false } }
      }
    });
  });

  afterEach(() => {
    cleanup();
    useStore.setState(initialState, true);
  });

  it('Checkbox değerlerini store durumuna göre doğru göstermeli', () => {
    render(<VisibilityTab isEn={false} />);
    expect(screen.getByLabelText('visibility.family')).toBeChecked();
    expect(screen.getByLabelText('visibility.countdown')).not.toBeChecked();
  });

  it('Checkbox değiştirildiğinde store güncellenmeli', () => {
    render(<VisibilityTab isEn={false} />);
    const familyCheck = screen.getByLabelText('visibility.family');
    
    fireEvent.click(familyCheck);
    
    expect(useStore.getState().adminDraft.settings.visibility.family).toBe(false);
  });
});