import React, { useState } from 'react';

const QuizModal = ({ noteId, onClose, onRefresh }) => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/flashcards/${noteId}`);
      const data = await res.json();
      setCards(data);
    } catch (err) {
      console.error("Failed to load cards", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (quality) => {
    try {
      await fetch(`http://localhost:8080/flashcards/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cards[currentIndex].id, quality }),
      });
    } catch (err) {
      console.error("Review update failed", err);
    }
    setShowAnswer(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
      loadCards(); // Refresh cards after full set
    }
  };

  const generateCards = async () => {
    setIsLoading(true);
    try {
      // We assume the active note content is passed in some way or we fetch it
      // For this simple version, we'll let the parent handle generating and we just refresh
      await onRefresh();
      loadCards();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [noteId]);

  if (isLoading) return <div className="flex items-center justify-center h-full text-slate-500 font-medium">Loading cards...</div>;
  if (cards.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
      <p className="text-slate-500">No flashcards found for this note.</p>
      <button
        onClick={generateCards}
        className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider"
      >
        Generate AI Cards
      </button>
    </div>
  );

  const card = cards[currentIndex];

  return (
    <div className="flex flex-col h-full p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Card {currentIndex + 1} of {cards.length}
        </span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-full max-w-lg p-12 bg-white rounded-3xl border border-slate-200 shadow-xl transition-all">
          <h3 className="text-xl font-bold text-slate-800 leading-relaxed">{card.question}</h3>
          {showAnswer && (
            <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
              <p className="text-slate-600 leading-relaxed">{card.answer}</p>
            </div>
          )}
        </div>

        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-sm shadow-lg hover:bg-blue-700 transition-all"
          >
            Show Answer
          </button>
        ) : (
          <div className="flex gap-3">
            {[1, 3, 5].map(q => (
              <button
                key={q}
                onClick={() => handleReview(q)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                {q === 1 ? 'Hard' : q === 3 ? 'Good' : 'Easy'}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
