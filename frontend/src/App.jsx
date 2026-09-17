import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import Editor from './components/Editor';
import Suggestion from './components/Suggestion';
import Sidebar from './components/Sidebar';
import HealthBanner from './components/HealthBanner';
import QuizModal from './components/QuizModal';
import Toast from './components/Toast';
import { useOllamaHealth } from './hooks/useOllamaHealth';
import { api, API_URL } from './services/api';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const activeNote = notes.find(n => n.id === activeNoteId);

  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('qwen2.5');
  const [suggestion, setSuggestion] = useState("");
  const [beforeText, setBeforeText] = useState("");
  const [responseTime, setResponseTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const typingTimeoutRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const health = useOllamaHealth();

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const data = await api.getNotes();
        setNotes(data);
        if (data.length > 0) setActiveNoteId(data[0].id);
      } catch (err) {
        setError("Failed to load notes from backend.");
      }
    };

    const loadModels = async () => {
      try {
        const data = await api.getModels();
        const modelsArray = Array.isArray(data) ? data : [];
        setModels(modelsArray);
        if (modelsArray.length > 0) {
          // Default to qwen2.5 if available, otherwise use the first available model
          const defaultModel = modelsArray.find(m => m.name && m.name.includes('qwen2.5')) || modelsArray[0];
          setSelectedModel(defaultModel.name);
        }
      } catch (err) {
        console.error("Failed to load models:", err);
        setModels([]);
      }
    };

    loadNotes();
    loadModels();
  }, []);

  const handleUpdateNote = (newContent) => {
    if (!activeNote) return;

    // 1. Optimistic update for instant UI response
    setNotes(prevNotes => prevNotes.map(note =>
      note.id === activeNoteId ? { ...note, content: newContent } : note
    ));

    // 2. Debounce the backend save to prevent request flooding
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await api.saveNote({ ...activeNote, content: newContent });
      } catch (err) {
        setError("Failed to save note to backend.");
      } finally {
        setIsSaving(false);
      }
    }, 1000); // Save 1 second after user stops typing
  };

  const handleNewNote = async () => {
    const newNote = {
      title: "Untitled",
      content: "",
      subject: "General",
    };

    try {
      const savedNote = await api.saveNote(newNote);
      setNotes(prev => [savedNote, ...prev]);
      setActiveNoteId(savedNote.id);
      setSuggestion("");
    } catch (err) {
      setError("Failed to create note.");
    }
  };

  const handleDeleteNote = async (idToDelete) => {
    try {
      await api.deleteNote(idToDelete);
      const updatedNotes = notes.filter(note => note.id !== idToDelete);
      setNotes(updatedNotes);
      if (activeNoteId === idToDelete) {
        setActiveNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
        setSuggestion("");
      }
    } catch (err) {
      setError("Failed to delete note.");
    }
  };

  const fetchEnhancement = async (textToEnhance, mode = 'enhance') => {
    setIsLoading(true);
    setError(null);
    setBeforeText(textToEnhance);
    setSuggestion("");
    const start = performance.now();

    try {
      const result = await api.enhance(textToEnhance, mode, selectedModel, true);

      const reader = result.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            const content = json.message?.content || json.response || "";
            fullText += content;
            setSuggestion(fullText);
          } catch (e) {
            console.error("JSON parse error:", e, "Line:", line);
          }
        }
      }

      if (buffer.trim()) {
        try {
          const json = JSON.parse(buffer);
          fullText += json.message?.content || json.response || "";
          setSuggestion(fullText);
        } catch (e) {}
      }

      setResponseTime(Math.round(performance.now() - start));
    } catch (err) {
      setError(err.message || "Cannot connect to AI Core.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEnhance = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (activeNote?.content.trim()) fetchEnhancement(activeNote.content);
  };

  const handleAcceptSuggestion = () => {
    if (!suggestion) return;
    handleUpdateNote(suggestion);
    setSuggestion("");
  };

  const handleExportPDF = () => {
    if (!activeNote) return;

    const doc = new jsPDF();
    const margin = 20;
    let cursorY = 20;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(activeNote.title || "Untitled", margin, cursorY);
    cursorY += 12;

    // Subject & Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Subject: ${activeNote.subject || "General"}`, margin, cursorY);
    doc.text(`Date: ${activeNote.created_at || activeNote.date || "N/A"}`, 190 - 30, cursorY, { align: "right" });
    cursorY += 6;

    // Horizontal Line
    doc.setDrawColor(200);
    doc.line(margin, cursorY, 190, cursorY);
    cursorY += 10;

    // Content (Simplified Markdown Rendering)
    doc.setTextColor(0);
    const lines = (activeNote.content || "").split("\n");

    lines.forEach(line => {
      if (cursorY > 280) {
        doc.addPage();
        cursorY = 20;
      }

      if (line.startsWith("# ")) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(line.substring(2), margin, cursorY);
        cursorY += 8;
      } else if (line.startsWith("## ")) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(line.substring(3), margin, cursorY);
        cursorY += 7;
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const text = line.substring(2);
        const splitText = doc.splitTextToSize("• " + text, 170);
        doc.text(splitText, margin, cursorY);
        cursorY += (splitText.length * 6);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const splitText = doc.splitTextToSize(line, 170);
        doc.text(splitText, margin, cursorY);
        cursorY += (splitText.length * 6);
      }
      cursorY += 2;
    });

    doc.save(`note_${activeNote.id || 'export'}.pdf`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] text-slate-900 font-sans overflow-hidden selection:bg-blue-200">
      <HealthBanner health={health} />
      {error && <Toast message={error} onClose={() => setError(null)} />}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={setActiveNoteId}
          onNewNote={handleNewNote}
          onDeleteNote={handleDeleteNote}
        />

        <div className="flex-1 flex flex-col h-full z-10">
          {notes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 h-full">
              <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 className="text-xl font-bold mb-2 text-slate-800">Your workspace is empty</h2>
              <p className="mb-6 text-slate-500 text-sm">Create a new note to start writing.</p>
              <button
                onClick={handleNewNote}
                className="px-6 py-2.5 bg-black hover:bg-slate-800 text-white font-medium rounded-lg transition-all shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Note
              </button>
            </div>
          ) : (
            <>
              <header className="px-12 py-10 flex justify-between items-end shrink-0 z-20">
                <div className="w-full max-w-3xl">
                  <input
                    type="text"
                    value={activeNote?.title || ""}
                    onChange={async (e) => {
                      const newTitle = e.target.value;
                      setNotes(notes.map(n => n.id === activeNoteId ? { ...n, title: newTitle } : n));
                      try {
                        await api.saveNote({ ...activeNote, title: newTitle });
                      } catch (err) {
                        setError("Failed to save title");
                      }
                    }}
                    className="text-4xl font-extrabold text-slate-900 bg-transparent outline-none w-full placeholder:text-slate-300 transition-all"
                    placeholder="Note Title"
                    aria-label="Note Title"
                  />
                  <div className="flex gap-4 mt-4 items-center">
                    <input
                      type="text"
                      value={activeNote?.subject || ""}
                      onChange={async (e) => {
                        const newSubject = e.target.value;
                        setNotes(notes.map(n => n.id === activeNoteId ? { ...n, subject: newSubject } : n));
                        try {
                          await api.saveNote({ ...activeNote, subject: newSubject });
                        } catch (err) {
                          setError("Failed to save subject");
                        }
                      }}
                      className="text-xs font-bold tracking-wider uppercase text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded outline-none w-32 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all shadow-sm"
                      placeholder="SUBJECT"
                      aria-label="Note Subject"
                    />
                    <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                    <p className="text-sm font-medium text-slate-500">{activeNote?.created_at || activeNote?.date}</p>
                    <button
                      onClick={() => {
                        if (!activeNoteId) return;
                        window.open(`http://127.0.0.1:8080/notes/export/${activeNoteId}`, '_blank');
                      }}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      title="Export this note as a Markdown file"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      title="Export this note as a PDF"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.828a2 2 0 00-1.172-1.828l-4.438-4.438a2 2 0 00-2.828 0l-4.438 4.438A2 2 0 005 9.828V19a2 2 0 002 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v6m0 0l-2-2m2 2l2-2" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                    <span className={`h-2 w-2 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                    {error ? 'Offline' : isSaving ? 'Saving...' : 'Connected'}
                  </div>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="text-[10px] font-bold tracking-widest uppercase text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-full shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer"
                  >
                    {models.map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </header>

              <div className="px-12 pb-10 flex-1 grid grid-cols-1 xl:grid-cols-2 gap-8 h-[calc(100vh-160px)]">
                <Editor
                  note={activeNote?.content || ""}
                  setNote={handleUpdateNote}
                  isLoading={isLoading}
                  onEnhance={handleManualEnhance}
                />
                <Suggestion
                  suggestion={suggestion}
                  isLoading={isLoading}
                  error={error}
                  onAccept={handleAcceptSuggestion}
                  beforeText={beforeText}
                  speed={responseTime}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
