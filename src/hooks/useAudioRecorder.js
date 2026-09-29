import { useState, useRef } from 'react';
import { uploadMediaFile } from '../services/database';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        clearInterval(timerRef.current);
        // Mikrofonu kapat
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      console.error("Mikrofon izni alınamadı:", err);
      alert("Ses kaydetmek için mikrofon erişimine izin vermeniz gerekiyor.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const uploadAudio = async () => {
    if (!audioBlob) return null;
    const file = new File([audioBlob], `wish_audio_${Date.now()}.webm`, { type: 'audio/webm' });
    return await uploadMediaFile(file, 'audio_wishes'); 
  };

  return { 
    isRecording, 
    recordingTime, 
    startRecording, 
    stopRecording, 
    clearRecording, 
    audioBlob, 
    uploadAudio 
  };
}