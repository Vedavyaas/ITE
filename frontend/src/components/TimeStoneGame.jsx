import { useState, useEffect, useRef } from 'react';

const COLORS = [
  { id: 0, hex: '#22c55e', label: 'Time' },
  { id: 1, hex: '#3b82f6', label: 'Space' },
  { id: 2, hex: '#ef4444', label: 'Reality' },
  { id: 3, hex: '#eab308', label: 'Mind' },
  { id: 4, hex: '#a855f7', label: 'Power' },
  { id: 5, hex: '#f97316', label: 'Soul' }
];

export default function TimeStoneGame({ onWin }) {
  const [sequence, setSequence] = useState([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [dormammuMessage, setDormammuMessage] = useState('');
  const timeoutRef = useRef(null);

  const SEQUENCE_LENGTH = 12;

  const startSequence = () => {
    setDormammuMessage('');
    const newSeq = [Math.floor(Math.random() * 6)];
    setSequence(newSeq);
    setPlayerStep(0);
    playSequence(newSeq);
  };

  const playSequence = (seq) => {
    setIsPlaying(true);
    let i = 0;
    
    const playNext = () => {
      if (i < seq.length) {
        setActiveButton(seq[i]);
        timeoutRef.current = setTimeout(() => {
          setActiveButton(null);
          timeoutRef.current = setTimeout(() => {
            i++;
            playNext();
          }, 150); // gap between flashes
        }, 300); // flash duration
      } else {
        setIsPlaying(false);
      }
    };

    // slight delay before starting to play
    timeoutRef.current = setTimeout(playNext, 500);
  };

  const handleButtonClick = (id) => {
    if (isPlaying) return; // Prevent clicking while sequence is playing

    // Light up button briefly
    setActiveButton(id);
    setTimeout(() => setActiveButton(null), 300);

    if (id === sequence[playerStep]) {
      const nextStep = playerStep + 1;
      if (nextStep === sequence.length) {
        if (sequence.length === SEQUENCE_LENGTH) {
          setTimeout(() => { if (onWin) onWin(); }, 500);
        } else {
          const newSeq = [...sequence, Math.floor(Math.random() * 6)];
          setSequence(newSeq);
          setPlayerStep(0);
          playSequence(newSeq);
        }
      } else {
        setPlayerStep(nextStep);
      }
    } else {
      // Failed! Time loop resets.
      setDormammuMessage("Dormammu, I've come to bargain...");
      setTimeout(() => {
        setDormammuMessage('');
        startSequence(); // reset loop automatically
      }, 2000);
    }
  };

  // cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, []);

  return (
    <div className="time-stone-container fade-in" style={{ padding: '0.5rem', maxWidth: '420px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
      <h3 style={{ color: 'var(--time)', fontFamily: "'Rajdhani', sans-serif", fontSize: '1.4rem', marginBottom: '0.25rem', letterSpacing: '2px', fontWeight: 700 }}>
        Temporal Resonance
      </h3>
      <div style={{ fontSize: '0.65rem', color: 'rgba(34,197,94,0.7)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 600 }}>
        Pattern Recall Matrix
      </div>
      
      {/* Live turn status */}
      <div style={{ minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
        {dormammuMessage ? (
          <div style={{ color: '#ef4444', fontStyle: 'italic', fontWeight: 600, fontSize: '0.9rem', animation: 'shake 0.5s' }}>
            ⚠ {dormammuMessage}
          </div>
        ) : (
          <div style={{
            color: isPlaying ? '#60a5fa' : sequence.length > 0 ? '#22c55e' : 'var(--silver)',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '1px',
          }}>
            {sequence.length === 0
              ? 'Press "Start Time Loop" to begin'
              : isPlaying
                ? '⏳ Watch sequence closely...'
                : `👉 Your turn: Tap stone ${playerStep + 1} of ${sequence.length}`}
          </div>
        )}
      </div>

      {/* 6 Stone Pad Matrix */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: 'clamp(0.85rem, 3vw, 1.25rem)', 
        marginBottom: '1.25rem',
        padding: 'clamp(1rem, 3.5vw, 1.5rem)',
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '16px',
        border: '1px solid rgba(34,197,94,0.15)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {COLORS.map((c) => {
          const isActive = activeButton === c.id;
          const isDisabled = sequence.length === 0 || isPlaying || Boolean(dormammuMessage);

          return (
            <button
              key={c.id}
              onClick={() => handleButtonClick(c.id)}
              disabled={isDisabled}
              aria-label={`${c.label} Stone`}
              style={{
                width: '100%',
                aspectRatio: '1/1',
                borderRadius: '50%',
                border: `3px solid ${isActive ? '#ffffff' : c.hex}`,
                background: isActive ? c.hex : 'rgba(0,0,0,0.5)',
                boxShadow: isActive ? `0 0 28px ${c.hex}, inset 0 0 10px rgba(255,255,255,0.6)` : 'none',
                transition: 'all 0.15s ease',
                cursor: isDisabled ? 'default' : 'pointer',
                opacity: isActive ? 1 : 0.45,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 'clamp(0.68rem, 2.4vw, 0.85rem)',
                fontWeight: 700,
                letterSpacing: '1px',
                color: isActive ? '#ffffff' : c.hex,
                textTransform: 'uppercase',
                textShadow: isActive ? '0 0 8px #ffffff' : 'none',
              }}>
                {c.label}
              </span>
            </button>
          );
        })}
      </div>

      {sequence.length === 0 && !dormammuMessage && (
        <button 
          className="btn btn-primary" 
          onClick={startSequence}
          style={{
            width: '100%',
            maxWidth: '300px',
            margin: '0 auto',
            display: 'block',
            padding: '0.85rem 1.5rem',
            fontSize: '1rem',
            letterSpacing: '2px',
            fontFamily: "'Rajdhani', sans-serif",
            background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
            border: 'none',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(34,197,94,0.3)',
          }}
        >
          ⚡ Start Time Loop
        </button>
      )}

      {sequence.length > 0 && !dormammuMessage && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: "'Rajdhani', sans-serif", color: 'rgba(255,255,255,0.6)', letterSpacing: '1.5px', marginBottom: '0.35rem' }}>
            <span>LOOP PROGRESSION</span>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>{sequence.length} / {SEQUENCE_LENGTH}</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${(sequence.length / SEQUENCE_LENGTH) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #15803d, #22c55e)',
              boxShadow: '0 0 10px rgba(34,197,94,0.5)',
              transition: 'width 0.2s ease',
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
