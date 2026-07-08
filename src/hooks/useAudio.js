import { useRef, useState, useEffect, useCallback } from "react";
import { DEFAULT_WEDDING_MUSIC_FILE } from "../config/constants";

export function useAudio(musicFile) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const musicIntervalRef = useRef(null);
  const musicGainRef = useRef(null);
  const cleanupAudioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.load();
  }, [musicFile]);

  useEffect(() => {
    cleanupAudioRef.current = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }
      if (musicIntervalRef.current) {
        clearTimeout(musicIntervalRef.current);
        musicIntervalRef.current = null;
      }
      if (musicGainRef.current) {
        try { musicGainRef.current.disconnect(); } catch (e) {}
        musicGainRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try { audioContextRef.current.close(); } catch (e) {}
        audioContextRef.current = null;
      }
      setIsMusicPlaying(false);
    };

    return () => {
      if (cleanupAudioRef.current) cleanupAudioRef.current();
    };
  }, []);

  const stopMusic = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    if (musicIntervalRef.current) {
      clearTimeout(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
    if (musicGainRef.current) {
      try { musicGainRef.current.disconnect(); } catch (e) {}
      musicGainRef.current = null;
    }
    setIsMusicPlaying(false);
  }, []);

  const startGeneratedMusic = useCallback(async () => {
    if (musicIntervalRef.current) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error("Bu tarayıcı Web Audio API desteklemiyor.");

    const audioContext = audioContextRef.current || new AudioContext();
    audioContextRef.current = audioContext;
    await audioContext.resume();

    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.06, audioContext.currentTime);
    masterGain.connect(audioContext.destination);
    musicGainRef.current = masterGain;

    const weddingMelody = [
      { frequency: 523.25, duration: 0.55 }, { frequency: 659.25, duration: 0.55 },
      { frequency: 783.99, duration: 0.85 }, { frequency: 659.25, duration: 0.55 },
      { frequency: 698.46, duration: 0.55 }, { frequency: 783.99, duration: 1.05 },
      { frequency: 523.25, duration: 0.55 }, { frequency: 587.33, duration: 0.55 },
      { frequency: 659.25, duration: 0.85 }, { frequency: 587.33, duration: 0.55 },
      { frequency: 523.25, duration: 1.05 }, { frequency: 659.25, duration: 0.55 },
      { frequency: 783.99, duration: 0.55 }, { frequency: 880.0, duration: 0.85 },
      { frequency: 783.99, duration: 0.55 }, { frequency: 659.25, duration: 1.1 },
      { frequency: 523.25, duration: 0.6 },  { frequency: 659.25, duration: 0.6 },
      { frequency: 783.99, duration: 1.25 },
    ];

    let noteIndex = 0;
    const playNote = () => {
      if (!musicGainRef.current) return;
      const note = weddingMelody[noteIndex % weddingMelody.length];
      const now = audioContext.currentTime;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(note.frequency, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.duration);

      oscillator.connect(gain);
      gain.connect(masterGain);

      oscillator.start(now);
      oscillator.stop(now + note.duration + 0.05);

      noteIndex += 1;
      musicIntervalRef.current = window.setTimeout(playNote, note.duration * 1000 + 90);
    };
    playNote();
  }, []);

  const startMusic = useCallback(async () => {
    try {
      if (musicFile && audioRef.current) {
        if (musicIntervalRef.current) {
          clearTimeout(musicIntervalRef.current);
          musicIntervalRef.current = null;
        }
        if (musicGainRef.current) {
          try { musicGainRef.current.disconnect(); } catch (e) {}
          musicGainRef.current = null;
        }
        try {
          audioRef.current.volume = 0.15;
          await audioRef.current.play();
          setIsMusicPlaying(true);
          return;
        } catch (audioError) {
          console.log("Müzik dosyası çalınamadı, yedek melodi deneniyor:", audioError);
          if (musicFile !== DEFAULT_WEDDING_MUSIC_FILE) throw audioError;
        }
      }
      await startGeneratedMusic();
      setIsMusicPlaying(true);
    } catch (error) {
      setIsMusicPlaying(false);
      console.log("Müzik başlatılamadı:", error);
    }
  }, [musicFile, startGeneratedMusic]);

  const toggleMusic = useCallback(async () => {
    if (isMusicPlaying) stopMusic();
    else await startMusic();
  }, [isMusicPlaying, stopMusic, startMusic]);

  return { audioRef, isMusicPlaying, setIsMusicPlaying, startMusic, stopMusic, toggleMusic };
}