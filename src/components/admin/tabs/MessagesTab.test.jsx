import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MessagesTab } from './MessagesTab';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useStore');

describe('MessagesTab Admin Bileşen Testleri', () => {
  let mockUpdateDraftObject;

  beforeEach(() => {
    mockUpdateDraftObject = vi.fn();
    useStore.mockImplementation((selector) => selector({
      adminDraft: {
        messages: {
          guestGreeting: "Merhaba {guest}, düğünümüze bekleriz.",
          whatsappShareMessage: "Davetiyemiz: {link}",
          rsvpWhatsappMessage: "LCV formunu doldurdum!"
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

  it('Kayıtlı mesaj şablonlarını doğru şekilde inputlara yerleştirmeli', () => {
    render(<MessagesTab isEn={false} />);
    
    expect(screen.getByDisplayValue('Merhaba {guest}, düğünümüze bekleriz.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Davetiyemiz: {link}')).toBeInTheDocument();
  });

  it('Metin değiştirildiğinde updateDraftObject fonksiyonu çağrılmalı', () => {
    render(<MessagesTab isEn={false} />);
    
    const greetingTextarea = screen.getByDisplayValue('Merhaba {guest}, düğünümüze bekleriz.');
    fireEvent.change(greetingTextarea, { target: { value: 'Selam {guest}!' } });
    
    expect(mockUpdateDraftObject).toHaveBeenCalledWith('messages', 'guestGreeting', 'Selam {guest}!');
  });
});