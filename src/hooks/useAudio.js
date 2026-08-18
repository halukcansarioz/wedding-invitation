import { useRef, useState, useEffect, useCallback } from "react";
import { DEFAULT_WEDDING_MUSIC_FILE } from "../config/constants";

export function useAudio(musicFile) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [musicFile]);

  const stopMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsMusicPlaying(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("wedding-music-muted", "true");
    }
  }, []);

  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, [stopMusic]);

  const startMusic = useCallback(async (forcePlay = false) => {
    if (forcePlay !== true && typeof window !== "undefined") {
      if (localStorage.getItem("wedding-music-muted") === "true") {
        return;
      }
    }

    try {
      if (musicFile && audioRef.current) {
        audioRef.current.volume = 0.15;
        await audioRef.current.play();
        setIsMusicPlaying(true);
        if (typeof window !== "undefined") localStorage.setItem("wedding-music-muted", "false");
      }
    } catch (error) {
      console.error("Müzik başlatılamadı:", error);
      setIsMusicPlaying(false);
    }
  }, [musicFile]);

  const toggleMusic = useCallback(async () => {
    if (isMusicPlaying) {
      stopMusic();
    } else {
      await startMusic(true);
    }
  }, [isMusicPlaying, stopMusic, startMusic]);

  return { audioRef, isMusicPlaying, setIsMusicPlaying, startMusic, stopMusic, toggleMusic };
}