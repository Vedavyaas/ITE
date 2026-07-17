import { useState, useEffect } from 'react';

// ── Mixed: Marvel characters/items + circuit/tech symbols ──────────────
const ALL_SYMBOLS = [
  // Marvel
  { symbol: '⚡', label: 'Thor',      color: '#FBBF24', bg: 'rgba(251,191,36,0.15)'  },
  { symbol: '🕷️', label: 'Spider',    color: '#E23636', bg: 'rgba(226,54,54,0.15)'   },
  { symbol: '🤖', label: 'Iron Man',  color: '#C8922A', bg: 'rgba(200,146,42,0.15)'  },
  { symbol: '⭐', label: 'Captain',   color: '#3b82f6', bg: 'rgba(59,130,246,0.15)'  },
  { symbol: '🌀', label: 'Strange',   color: '#22d3ee', bg: 'rgba(34,211,238,0.15)'  },
  { symbol: '🚀', label: 'Guardians', color: '#f97316', bg: 'rgba(249,115,22,0.15)'  },
  { symbol: '🦅', label: 'Falcon',    color: '#60C8F8', bg: 'rgba(96,200,248,0.15)'  },
  { symbol: '🏹', label: 'Hawkeye',   color: '#F97316', bg: 'rgba(249,115,22,0.15)'  },
  // Circuit / tech
  { symbol: '⚙️', label: 'Gear',      color: '#C8CEDF', bg: 'rgba(200,206,223,0.12)' },
  { symbol: '🔌', label: 'Power',     color: '#FBBF24', bg: 'rgba(251,191,36,0.12)'  },
  { symbol: '💡', label: 'Signal',    color: '#60C8F8', bg: 'rgba(96,200,248,0.12)'  },
  { symbol: '📡', label: 'Radar',     color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  { symbol: '🖥️', label: 'Core',      color: '#9333ea', bg: 'rgba(147,51,234,0.12)'  },
  { symbol: '⚛️', label: 'Reactor',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  { symbol: '🔋', label: 'Cell',      color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  { symbol: '🧲', label: 'Magnet',    color: '#E23636', bg: 'rgba(226,54,54,0.12)'   },
  { symbol: '💾', label: 'Memory',    color: '#C8CEDF', bg: 'rgba(200,206,223,0.12)' },
  { symbol: '🔧', label: 'Wrench',    color: '#C8922A', bg: 'rgba(200,146,42,0.12)'  },
];

export default function MemoryGame({ gridSize = 4, onComplete, onResetClick }) {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [locked, setLocked] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize]);

  const initGame = () => {
    const pairCount = (gridSize * gridSize) / 2;
    const selected = ALL_SYMBOLS.slice(0, pairCount);

    const deck = [...selected, ...selected]
      .sort(() => Math.random() - 0.5)
      .map((item, idx) => ({ id: idx, ...item }));

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
      const [a, b] = newFlipped;

      if (cards[a].symbol === cards[b].symbol) {
        const newMatched = [...matchedIndices, a, b];
        setMatchedIndices(newMatched);
        setFlippedIndices([]);
        setLocked(false);
        if (newMatched.length === cards.length) {
          setIsDone(true);
          if (onComplete) setTimeout(onComplete, 500);
        }
      } else {
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

  const isSmall = gridSize === 6;

  return (
    <div className="memory-game-container">
      <div
        className={`memory-grid fade-in grid-${gridSize}`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: isSmall ? '0.3rem' : '0.5rem',
          maxWidth: gridSize === 4 ? '360px' : '520px',
          margin: '0 auto',
        }}
      >
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || matchedIndices.includes(idx);
          const isMatched = matchedIndices.includes(idx);

          return (
            <div
              key={card.id}
              className={`memory-card ${isFlipped ? 'flipped' : ''}`}
              onClick={() => handleCardClick(idx)}
            >
              <div className="memory-card-inner">

                {/* ── Card back: shield + S.H.I.E.L.D label via CSS ::after/::before ── */}
                <div className="memory-card-front" />

                {/* ── Card face: symbol with themed color ── */}
                <div
                  className="memory-card-back"
                  style={{
                    background: isMatched
                      ? `linear-gradient(135deg, ${card.bg.replace('0.15', '0.35')}, ${card.bg.replace('0.12', '0.25')})`
                      : card.bg,
                    border: `2px solid ${card.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: isSmall ? '1.4rem' : '2rem', lineHeight: 1 }}>
                    {card.symbol}
                  </span>
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
