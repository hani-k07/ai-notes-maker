import React from 'react';

const HealthBanner = ({ health }) => {
  if (health.status === 'checking') return null;

  const isHealthy = health.status === 'healthy';
  const isDegraded = health.status === 'degraded';

  const bgColor = isHealthy ? 'bg-emerald-50' : isDegraded ? 'bg-amber-50' : 'bg-red-50';
  const textColor = isHealthy ? 'text-emerald-700' : isDegraded ? 'text-amber-700' : 'text-red-700';
  const borderColor = isHealthy ? 'border-emerald-100' : isDegraded ? 'border-amber-100' : 'border-red-100';
  const iconColor = isHealthy ? 'text-emerald-500' : isDegraded ? 'text-amber-500' : 'text-red-500';

  return (
    <div className={`px-12 py-2 border-b ${bgColor} ${borderColor} border transition-all animate-in fade-in slide-in-from-top-2 duration-300`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${iconColor} animate-pulse`}></span>
            <span className={textColor}>System: {health.status}</span>
          </div>
          <div className={`flex items-center gap-1.5 ${health.ollama === 'connected' ? 'text-slate-500' : textColor}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Ollama: {health.ollama}
          </div>
          <div className={`flex items-center gap-1.5 ${health.whisper === 'connected' ? 'text-slate-500' : textColor}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" /></svg>
            Whisper: {health.whisper}
          </div>
        </div>
        {health.error && <span className={textColor}>{health.error}</span>}
      </div>
    </div>
  );
};

export default HealthBanner;
