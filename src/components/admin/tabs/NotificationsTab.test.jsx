import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationsTab } from './NotificationsTab';

const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn()
}));

vi.mock('../../../supabaseClient', () => ({
  supabase: { functions: { invoke: mockInvoke } }
}));

describe('NotificationsTab Kapsamlı Bileşen Testleri', () => {
  let alertMock;

  beforeEach(() => {
    vi.clearAllMocks();
    alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    alertMock.mockRestore();
  });

  it('Başlık veya mesaj boş bırakıldığında uyarı (alert) vermeli ve API çağrısı YAPMAMALI', async () => {
    render(<NotificationsTab isEn={false} />);

    const sendBtn = screen.getByRole('button', { name: /Anlık Bildirimi Gönder/i });
    fireEvent.click(sendBtn);

    expect(alertMock).toHaveBeenCalledWith('Lütfen bildirim başlığı ve mesajını doldurun.');
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('Bildirim gönderilirken buton metni "İletiliyor..." olarak değişmeli ve disable olmalı', async () => {
    mockInvoke.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: { count: 10 }, error: null }), 500)));
    
    render(<NotificationsTab isEn={false} />);

    fireEvent.change(screen.getByPlaceholderText(/Örn: Nikah Töreni Başlıyor!/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText(/Örn: Lütfen yerlerinizi alın/i), { target: { value: 'Test' } });

    const sendBtn = screen.getByRole('button', { name: /Anlık Bildirimi Gönder/i });
    fireEvent.click(sendBtn);

    expect(screen.getByRole('button')).toHaveTextContent(/İletiliyor/i);
    expect(screen.getByRole('button')).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('✅ Bildirim 10 aboneye başarıyla iletildi.')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent(/Anlık Bildirimi Gönder/i);
    });
  });
});