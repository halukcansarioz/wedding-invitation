import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataTab } from './DataTab';
import * as dbServices from '../../../services/database';

vi.mock('../../../services/database', () => ({
  syncFailedDeletes: vi.fn()
}));

describe('DataTab Admin Bileşen Testleri', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('Depolama Temizliği butonuna basıldığında syncFailedDeletes çalışmalı', async () => {
    dbServices.syncFailedDeletes.mockResolvedValue({ successCount: 2, failCount: 0 });
    
    render(<DataTab isEn={false} exportAllDataJson={vi.fn()} importAllDataJson={vi.fn()} dataImportText="" setDataImportText={vi.fn()} saveSiteContent={vi.fn()} />);
    
    const cleanBtn = screen.getByRole('button', { name: /Depolama Temizliğini Başlat/i });
    fireEvent.click(cleanBtn);
    
    expect(cleanBtn).toHaveTextContent(/Temizleniyor/i);
    
    await waitFor(() => {
      expect(screen.getByText('Temizlik tamamlandı: 2 yetim dosya silindi. 0 dosya beklemede.')).toBeInTheDocument();
    });
  });
});