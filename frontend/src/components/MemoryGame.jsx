import { useState, useEffect } from 'react';

const ALL_EMOJIS = [
  '🛡️', '⚡', '🕷️', '🤖', '🦇', '🔥', '🦅', '🏹', 
  '💎', '🧪', '🚀', '🌌', '💥', '🪐', '🧠', '⏳', '👁️', '🦾'
];

export default function MemoryGame({ gridSize = 4, onComplete, onResetClick }) {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [locked, setLocked] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Initialize the game
  useEffect(() => {
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize]);

  const initGame = () => {
    const pairCount = (gridSize * gridSize) / 2;
    const selectedEmojis = ALL_EMOJIS.slice(0, pairCount);
    
    // Create pairs and shuffle
    const deck = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji }));
      
    setCards(deck);
    setFlippedIndices([]);
    setMatchedIndices([]);
    setLocked(false);
    setIsDone(false);
  };

  const handleCardClick = (index) => {
    if (locked) return;
    if (flippedIndices.includes(index) || matchedIndices.includes(index)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      const [firstIdx, secondIdx] = newFlipped;
      
      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        // Match found
        const newMatched = [...matchedIndices, firstIdx, secondIdx];
        setMatchedIndices(newMatched);
        setFlippedIndices([]);
        setLocked(false);
        
        if (newMatched.length === cards.length) {
          setIsDone(true);
          if (onComplete) setTimeout(onComplete, 500);
        }
      } else {
        // No match, flip back after a delay
        setTimeout(() => {
          setFlippedIndices([]);
          setLocked(false);
        }, 1000);
      }
    }
  };

  const handleReset = () => {
    initGame();
    if (onResetClick) onResetClick();
  };

  return (
    <div className="memory-game-container">
      <div 
        className={`memory-grid fade-in grid-${gridSize}`} 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: gridSize === 6 ? '0.25rem' : '0.5rem',
          maxWidth: gridSize === 4 ? '350px' : '500px',
          margin: '0 auto'
        }}
      >
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || matchedIndices.includes(idx);
          return (
            <div 
              key={card.id} 
              className={`memory-card ${isFlipped ? 'flipped' : ''}`}
              onClick={() => handleCardClick(idx)}
            >
              <div className="memory-card-inner">
                <div className="memory-card-front" />
                <div className="memory-card-back">
                  {card.emoji}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={handleReset}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          ↻ Reset Grid
        </button>
      </div>
    </div>
  );
}
