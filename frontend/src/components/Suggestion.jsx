import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PropTypes from 'prop-types';

const Suggestion = ({ suggestion, isLoading, error, onAccept, beforeText, speed }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('result'); // 'result' or 'diff'

  const handleCopy = () => {
    if (suggestion) {
      navigator.clipboard.writeText(suggestion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all">
      <div className="flex justify-between items-center px-8 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-blue-500 animate-pulse' : suggestion ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            AI Suggestion
          </h2>
          {suggestion && !isLoading && (
            <div className="flex bg-slate-200/50 p-1 rounded-lg text-[10px] font-bold">
              <button
                onClick={() => setViewMode('result')}
                className={`px-2 py-0.5 rounded ${viewMode === 'result' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Result
              </button>
              <button
                onClick={() => setViewMode('diff')}
                className={`px-2 py-0.5 rounded ${viewMode === 'diff' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Diff
              </button>
            </div>
          )}
        </div>

        {suggestion && !isLoading && (
          <div className="flex items-center gap-3">
            {speed && (
              <span className="text-[10px] font-medium text-slate-400 tabular-nums">
                {speed}ms
              </span>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors border border-transparent hover:border-slate-200 flex items-center justify-center"
                title="Copy to clipboard"
              >
                {copied ? (
                  <span className="text-xs font-bold text-slate-700 px-1">Copied</span>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                )}
              </button>
              <button
                onClick={onAccept}
                className="px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                Apply Text
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {error ? (
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100 text-red-600 text-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="font-medium">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4 w-full">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-3 bg-slate-100 rounded-full animate-pulse ${i === 0 ? 'w-3/4' : i === 2 ? 'w-5/6' : 'w-full'}`}
              ></div>
            ))}
          </div>
        ) : suggestion ? (
          viewMode === 'result' ? (
            <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-2 duration-500">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {suggestion || ""}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original</span>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 leading-relaxed text-sm italic whitespace-pre-wrap">
                  {beforeText || "No original text"}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Enhanced</span>
                <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100 text-slate-700 leading-relaxed text-sm prose prose-slate max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {suggestion || ""}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <svg className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm font-medium">No suggestions yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestion;

Suggestion.propTypes = {
  suggestion: PropTypes.string,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onAccept: PropTypes.func.isRequired,
  beforeText: PropTypes.string,
  speed: PropTypes.number,
};

Suggestion.defaultProps = {
  suggestion: '',
  isLoading: false,
  error: null,
  beforeText: '',
  speed: null,
};
