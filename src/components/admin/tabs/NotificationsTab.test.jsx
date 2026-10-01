import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsTab } from './NotificationsTab';

// Hoisted kullanılarak mock sırası hatası düzeltildi
const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }));
vi.mock('../../../supabaseClient', () => ({
  supabase: { functions: { invoke: mockInvoke } }
}));

describe('NotificationsTab Admin Bileşen Testleri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('Form doluysa API isteği atmalı ve başarılı sonucunu ekranda göstermeli', async () => {
    mockInvoke.mockResolvedValue({ data: { count: 5 }, error: null });
    render(<NotificationsTab isEn={false} />);

    fireEvent.change(screen.getByPlaceholderText(/Örn: Nikah Töreni Başlıyor!/i), { target: { value: 'Test Başlık' } });
    fireEvent.change(screen.getByPlaceholderText(/Örn: Lütfen yerlerinizi alın/i), { target: { value: 'Test Mesaj' } });

    const sendBtn = screen.getByRole('button', { name: /Anlık Bildirimi Gönder/i });
    fireEvent.click(sendBtn);

    expect(mockInvoke).toHaveBeenCalledWith('send-push', expect.any(Object));
    await waitFor(() => {
      expect(screen.getByText('✅ Bildirim 5 aboneye başarıyla iletildi.')).toBeInTheDocument();
    });
  });
});