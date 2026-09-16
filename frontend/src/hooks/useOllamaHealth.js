import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useOllamaHealth = () => {
  const [health, setHealth] = useState({
    status: 'checking',
    ollama: null,
    model_ready: null,
    whisper: null,
    error: null
  });

  const checkHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealth({
        status: data.status,
        ollama: data.ollama,
        model_ready: data.model_ready,
        whisper: data.whisper,
        error: null
      });
    } catch (err) {
      setHealth(prev => ({ ...prev, status: 'unhealthy', error: err.message }));
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  return { ...health, refetch: checkHealth };
};
