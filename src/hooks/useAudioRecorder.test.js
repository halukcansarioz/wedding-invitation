import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAudioRecorder } from './useAudioRecorder';
import { uploadMediaFile } from '../services/database';

vi.mock('../services/database', () => ({
  uploadMediaFile: vi.fn().mockResolvedValue('https://cdn.example.com/audio.webm'),
}));

class MockMediaRecorder {
  constructor(stream, options) {
    this.stream = stream;
    this.options = options;
    this.state = 'inactive';
    this.chunks = [];
  }
  start() {
    this.state = 'recording';
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

  it('Mikrofon izni reddedildiğinde kayıt başlatmamalı ve kullanıcıyı bilgilendirmeli', async () => {
    const error = new Error('Permission denied');
    navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(error);
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => { await result.current.startRecording(); });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.audioBlob).toBeNull();
    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('mikrofon'));
    alertMock.mockRestore();
  });

  it('Kayıt varsa uploadAudio doğru dosya klasörüyle yüklemeli', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => { await result.current.startRecording(); });
    act(() => { result.current.stopRecording(); });
    let uploadedUrl;
    await act(async () => { uploadedUrl = await result.current.uploadAudio(); });

    expect(uploadedUrl).toBe('https://cdn.example.com/audio.webm');
    expect(uploadMediaFile).toHaveBeenCalledWith(
      expect.objectContaining({ name: expect.stringMatching(/^wish_audio_\d+\.webm$/), type: 'audio/webm' }),
      'audio_wishes'
    );
  });

  it('Kayıt yoksa uploadAudio hiçbir yükleme yapmadan null döndürmeli', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    let uploadedUrl;
    await act(async () => { uploadedUrl = await result.current.uploadAudio(); });

    expect(uploadedUrl).toBeNull();
    expect(uploadMediaFile).not.toHaveBeenCalled();
  });

  it('Kayıt durduğunda medya stream tracklerini durdurmalı', async () => {
    const stopTrack = vi.fn();
    navigator.mediaDevices.getUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: stopTrack }],
    });
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => { await result.current.startRecording(); });
    act(() => { result.current.stopRecording(); });

    expect(stopTrack).toHaveBeenCalledTimes(1);
  });

  it('Desteklenen MIME türü yoksa webm varsayılanını kullanmalı', async () => {
    global.MediaRecorder.isTypeSupported.mockReturnValue(false);
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => { await result.current.startRecording(); });

    expect(result.current.isRecording).toBe(true);
    expect(global.MediaRecorder.isTypeSupported).toHaveBeenCalledWith('audio/webm');
    expect(global.MediaRecorder.isTypeSupported).toHaveBeenCalledWith('audio/ogg');
  });
});
