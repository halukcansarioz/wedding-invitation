import React from 'react';
import { render, screen, fireEvent, cleanup } from '../../../../tests/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AdminActionButtons, AdminSection } from './AdminLayout';

describe('Admin Layout Bileşen Testleri', () => {
  afterEach(() => {
    cleanup(); // Testler arası DOM temizliği
    vi.clearAllMocks();
  });

  describe('AdminSection', () => {
    it('onSave propu verilmişse başlığın yanında Kaydet butonunu göstermeli', () => {
      const mockOnSave = vi.fn();
      render(<AdminSection title="Sistem Özeti" onSave={mockOnSave}><p>İçerik</p></AdminSection>);
      
      const saveButtons = screen.getAllByRole('button', { name: /Kaydet/i });
      expect(saveButtons[0]).toBeInTheDocument();

      fireEvent.click(saveButtons[0]);
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('onSave propu yoksa Kaydet butonunu GİZLEMELİ', () => {
      render(<AdminSection title="Sistem Özeti"><p>İçerik</p></AdminSection>);
      const saveButtons = screen.queryAllByRole('button', { name: /Kaydet/i });
      expect(saveButtons).toHaveLength(0); // cleanup sayesinde önceki testin butonu artık burada olmayacak
    });
  });
});