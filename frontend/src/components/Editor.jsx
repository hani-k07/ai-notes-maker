import React from 'react';

const Editor = ({ note, setNote, isLoading, onEnhance }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
      <div className="flex justify-between items-center px-8 py-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
          Editor
        </h2>
        <button 
          onClick={onEnhance}
          disabled={isLoading || !note.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Thinking...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Enhance
            </>
          )}
        </button>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Start writing..."
        className="flex-1 w-full p-8 bg-transparent resize-none outline-none text-slate-800 placeholder:text-slate-300 leading-relaxed text-lg font-medium"
        spellCheck="false"
      />
    </div>
  );
};

export default Editor;