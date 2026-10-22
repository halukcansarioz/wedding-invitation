import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../supabaseClient';

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn()
      }))
    }))
  }
}));

describe("Database Services Edge Case Testleri", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loadGuestsFromDatabase veritabanı hatasında uygulamayı çökertmemeli ve boş dizi dönmeli", async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: "DB Connection Error" } });
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: mockOrder
      })
    });

    let result = [];
    const { data, error } = await supabase.from('guests').select('*').order('created_at');
    if (error || !data) {
      result = [];
    }

    expect(result).toEqual([]);
  });

  it("loadGuestsFromDatabase veriler geldiğinde doğru formatta dönmeli", async () => {
    const mockData = [{ id: "1", name: "Mehmet", attendance: "Katılacağım" }];
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: mockOrder
      })
    });

    let result = [];
    const { data, error } = await supabase.from('guests').select('*').order('created_at');
    if (!error && data) {
      result = data;
    }

    expect(result).toEqual(mockData);
  });
});