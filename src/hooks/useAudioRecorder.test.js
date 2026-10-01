import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAudioRecorder } from './useAudioRecorder';

// Tarayıcı MediaRecorder API'sini taklit ediyoruz
class MockMediaRecorder {
  constructor(stream, options) {
    this.stream = stream;
    this.options = options;
    this.state = 'inactive';
    this.chunks = [];
  }
  start() {
    this.state = 'recording';
    // Kayıt başladığında bir data parçası simüle ediyoruz
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['chunk-data'], { type: 'audio/webm' }) });
    }
  }
  stop() {
    this.state = 'inactive';
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['chunk-data'], { type: 'audio/webm' }) });
    }
    if (this.onstop) {
      this.onstop();
    }
  }
}

describe('useAudioRecorder Hook Testleri', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    
    global.MediaRecorder = MockMediaRecorder;
    // isTypeSupported desteğini ekliyoruz
    global.MediaRecorder.isTypeSupported = vi.fn(() => true);
    
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }]
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

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.recordingTime).toBe(3);
  });

  it('stopRecording çağrıldığında kaydı durdurmalı ve audioBlob oluşturmalı', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      result.current.stopRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.audioBlob).toBeInstanceOf(Blob);
  });

  it('clearRecording çağrıldığında durumu sıfırlamalı', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => { 
      await result.current.startRecording(); 
    });
    
    act(() => { 
      result.current.stopRecording(); 
    });
    
    expect(result.current.audioBlob).not.toBeNull();

    act(() => {
      result.current.clearRecording();
    });

    expect(result.current.audioBlob).toBeNull();
    expect(result.current.recordingTime).toBe(0);
  });
});