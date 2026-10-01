import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAudioRecorder } from './useAudioRecorder';

// Tarayıcı MediaRecorder API'sini taklit ediyoruz
class MockMediaRecorder {
  constructor() {
    this.start = vi.fn(() => { this.state = 'recording'; });
    this.stop = vi.fn(() => {
      this.state = 'inactive';
      if (this.onstop) this.onstop();
    });
    this.state = 'inactive';
  }
}

describe('useAudioRecorder Hook Testleri', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // setInterval için zamanı büküyoruz
    
    global.MediaRecorder = MockMediaRecorder;
    
    // Mikrofon erişimini taklit ediyoruz (getUserMedia)
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }] // track.stop() mock
        })
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('startRecording çağrıldığında kaydı başlatmalı ve sayacı artırmalı', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);
    expect(result.current.recordingTime).toBe(0);

    // 3 saniye ileri sar
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.recordingTime).toBe(3);
  });

  it('stopRecording çağrıldığında kaydı durdurmalı ve audioBlob oluşturmalı', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    // Önce başlat
    await act(async () => {
      await result.current.startRecording();
    });

    // Sonra durdur
    act(() => {
      result.current.stopRecording();
    });

    expect(result.current.isRecording).toBe(false);
    // MediaRecorder onstop tetiklendiği için bir blob oluşturulmuş olmalı
    expect(result.current.audioBlob).toBeInstanceOf(Blob);
  });

  it('clearRecording çağrıldığında durumu sıfırlamalı', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => { await result.current.startRecording(); });
    act(() => { result.current.stopRecording(); });
    
    expect(result.current.audioBlob).not.toBeNull();

    act(() => {
      result.current.clearRecording();
    });

    expect(result.current.audioBlob).toBeNull();
    expect(result.current.recordingTime).toBe(0);
  });
});