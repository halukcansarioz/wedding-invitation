import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CopyTab } from './CopyTab';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useStore');

describe('CopyTab Admin Bileşen Testleri', () => {
  let mockUpdateDraftObject;

  beforeEach(() => {
    mockUpdateDraftObject = vi.fn();

    useStore.mockImplementation((selector) => selector({
      adminDraft: {
        copy: {
          heroLabel: "Evleniyoruz",
          invitationTitle: "Davetlisiniz",
          wishesTitle: "Anı Defteri",
          thanksText: "Katıldığınız için teşekkürler."
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

  it('Taslak metinleri ilgili inputlara doğru şekilde yerleştirmeli', () => {
    render(<CopyTab isEn={false} />);
    
    expect(screen.getByDisplayValue('Evleniyoruz')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Davetlisiniz')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Katıldığınız için teşekkürler.')).toBeInTheDocument();
  });

  it('Bir başlık değiştirildiğinde updateDraftObject doğru parametrelerle tetiklenmeli', () => {
    render(<CopyTab isEn={false} />);
    
    const heroInput = screen.getByDisplayValue('Evleniyoruz');
    fireEvent.change(heroInput, { target: { value: 'Düğünümüze Hoş Geldiniz' } });
    
    expect(mockUpdateDraftObject).toHaveBeenCalledWith('copy', 'heroLabel', 'Düğünümüze Hoş Geldiniz');
  });

  it('Taslakta copy objesi yoksa bileşen çökmek yerine null dönmeli', () => {
    useStore.mockImplementation((selector) => selector({ adminDraft: {} }));
    const { container } = render(<CopyTab isEn={false} />);
    expect(container.firstChild).toBeNull();
  });
});