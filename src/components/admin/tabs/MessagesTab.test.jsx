import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MessagesTab } from './MessagesTab';
import { useStore } from '../../../store/useStore';

describe('MessagesTab Admin Bileşen Testleri', () => {
  let initialState;

  beforeEach(() => {
    initialState = useStore.getState();
    useStore.setState({
      adminDraft: {
        messages: {
          guestGreeting: "Merhaba {guest}, düğünümüze bekleriz.",
          whatsappShareMessage: "Davetiyemiz: {link}",
          rsvpWhatsappMessage: "LCV formunu doldurdum!"
        }
      }
    });
  });

  afterEach(() => {
    cleanup();
    useStore.setState(initialState, true);
    vi.clearAllMocks();
  });

  it('Kayıtlı mesaj şablonlarını doğru şekilde inputlara yerleştirmeli', () => {
    render(<MessagesTab isEn={false} />);
    
    expect(screen.getByDisplayValue('Merhaba {guest}, düğünümüze bekleriz.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Davetiyemiz: {link}')).toBeInTheDocument();
  });

  it('Metin değiştirildiğinde store güncellenmeli', () => {
    render(<MessagesTab isEn={false} />);
    
    const greetingTextarea = screen.getByDisplayValue('Merhaba {guest}, düğünümüze bekleriz.');
    fireEvent.change(greetingTextarea, { target: { value: 'Selam {guest}!' } });
    
    expect(useStore.getState().adminDraft.messages.guestGreeting).toBe('Selam {guest}!');
  });
});