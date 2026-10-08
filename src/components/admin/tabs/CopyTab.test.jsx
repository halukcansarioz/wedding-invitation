import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CopyTab } from './CopyTab';
import { useStore } from '../../../store/useStore';

describe('CopyTab Admin Bileşen Testleri', () => {
  let initialState;

  beforeEach(() => {
    initialState = useStore.getState();
    useStore.setState({
      adminDraft: {
        copy: {
          heroLabel: "Evleniyoruz",
          invitationTitle: "Davetlisiniz",
          wishesTitle: "Anı Defteri",
          thanksText: "Katıldığınız için teşekkürler."
        }
      }
    });
  });

  afterEach(() => {
    cleanup();
    useStore.setState(initialState, true);
    vi.clearAllMocks();
  });

  it('Taslak metinleri ilgili inputlara doğru şekilde yerleştirmeli', () => {
    render(<CopyTab isEn={false} />);
    
    expect(screen.getByDisplayValue('Evleniyoruz')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Davetlisiniz')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Katıldığınız için teşekkürler.')).toBeInTheDocument();
  });

  it('Bir başlık değiştirildiğinde store doğru şekilde güncellenmeli', () => {
    render(<CopyTab isEn={false} />);
    
    const heroInput = screen.getByDisplayValue('Evleniyoruz');
    fireEvent.change(heroInput, { target: { value: 'Düğünümüze Hoş Geldiniz' } });
    
    expect(useStore.getState().adminDraft.copy.heroLabel).toBe('Düğünümüze Hoş Geldiniz');
  });

  it('Taslakta copy objesi yoksa bileşen çökmek yerine boş dönmeli', () => {
    useStore.setState({ adminDraft: {} });
    const { container } = render(<CopyTab isEn={false} />);
    
    expect(container.firstChild).toBeEmptyDOMElement();
    
    expect(screen.queryByText(/Başlıklar ve Sayfa Metinleri/i)).not.toBeInTheDocument();
  });
});