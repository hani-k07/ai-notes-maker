import { useState, useRef } from 'react';

export const useMicRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        audioChunksRef.current = [];
        return audioBlob;
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      throw err;
    }
  };

  const stopRecording = async () => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) return resolve(null);

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        audioChunksRef.current = [];
        setIsRecording(false);
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    });
  };

  return {
    isRecording,
    isTranscribing,
    setIsTranscribing,
    startRecording,
    stopRecording
  };
};
