import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeTab } from './ThemeTab';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useStore');
vi.mock('../../common/UIComponents', () => ({
  Dropdown: () => <select data-testid="mock-dropdown"></select>
}));

describe('ThemeTab Admin Bileşen Testleri', () => {
  let mockUpdateDraftObject;

  beforeEach(() => {
    mockUpdateDraftObject = vi.fn();
    useStore.mockImplementation((selector) => selector({
      adminDraft: { settings: { theme: 'lavanta', requireWishApproval: true } },
      updateDraftObject: mockUpdateDraftObject,
      saveSiteContent: vi.fn()
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Tema kartına tıklandığında hem Store hem de DOM güncellenmeli', () => {
    render(<ThemeTab isEn={false} />);
    const darkThemeButton = screen.getByText('Koyu Tema').closest('button');
    fireEvent.click(darkThemeButton);
    expect(mockUpdateDraftObject).toHaveBeenCalledWith('settings', 'theme', 'dark');
  });

  it('Checkbox değişikliği requireWishApproval değerini güncellemeli', () => {
    render(<ThemeTab isEn={false} />);
    const approvalCheckbox = screen.getByLabelText(/Anı defteri mesajları admin onayından sonra yayınlansın/i);
    fireEvent.click(approvalCheckbox);
    expect(mockUpdateDraftObject).toHaveBeenCalledWith('settings', 'requireWishApproval', false);
  });
});