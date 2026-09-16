import React from 'react';

const Sidebar = ({ notes, activeNoteId, onSelectNote, onNewNote, onDeleteNote }) => {
  return (
    <div className="w-72 bg-[#F7F7F9] border-r border-slate-200 flex flex-col h-screen shrink-0 z-20">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            AI Notes
          </h1>
        </div>
        
        <button 
          onClick={onNewNote}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Note
        </button>
      </div>
      
      <div className="px-4 flex-1 overflow-y-auto pb-6">
        <h2 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3 px-2">
          Workspace
        </h2>
        <div className="flex flex-col gap-1.5">
          {notes.map(note => {
            const isActive = activeNoteId === note.id;
            return (
              <div 
                key={note.id} 
                onClick={() => onSelectNote(note.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group flex flex-col gap-1.5 relative ${
                  isActive 
                    ? 'bg-white border border-slate-200 text-slate-900 shadow-sm' 
                    : 'bg-transparent border border-transparent hover:bg-slate-200/50 text-slate-600'
                }`}
              >
                <div className="font-semibold text-sm flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <svg className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-slate-400 group-hover:text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="truncate">{note.title || "Untitled Note"}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 hover:text-red-600 text-slate-400 transition-all shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="text-[11px] font-medium text-slate-400 flex justify-between px-6">
                  <span className="truncate pr-2">{note.subject}</span>
                  <span className="shrink-0">{note.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;