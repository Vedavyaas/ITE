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
    <div className="time-stone-container fade-in" style={{ padding: '1rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
      <h3 style={{ color: 'var(--time)', fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        Observe and Repeat
      </h3>
      
      <div style={{ minHeight: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {dormammuMessage ? (
          <div style={{ color: '#ef4444', fontStyle: 'italic', animation: 'shake 0.5s' }}>
            {dormammuMessage}
          </div>
        ) : (
          <div style={{ color: 'var(--silver)' }}>
            {sequence.length === 0 ? "Ready to begin?" : isPlaying ? "Watch the sequence..." : "Your turn!"}
          </div>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '1.5rem', 
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.05)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {COLORS.map((c) => (
          <button
            key={c.id}
            onClick={() => handleButtonClick(c.id)}
            disabled={sequence.length === 0 || isPlaying || !!dormammuMessage}
            style={{
              width: '100%',
              aspectRatio: '1/1',
              borderRadius: '50%',
              border: `4px solid ${activeButton === c.id ? '#fff' : c.hex}`,
              background: activeButton === c.id ? c.hex : 'transparent',
              boxShadow: activeButton === c.id ? `0 0 25px ${c.hex}` : 'none',
              transition: 'all 0.15s ease',
              cursor: (sequence.length === 0 || isPlaying || !!dormammuMessage) ? 'default' : 'pointer',
              opacity: activeButton === c.id ? 1 : 0.4,
              padding: 0
            }}
          />
        ))}
      </div>

      {sequence.length === 0 && !dormammuMessage && (
        <button 
          className="btn btn-primary" 
          onClick={startSequence}
          style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', fontFamily: "'Rajdhani', sans-serif", background: 'var(--time)', borderColor: 'var(--time)' }}
        >
          Initialize Time Loop
        </button>
      )}

      {sequence.length > 0 && !dormammuMessage && (
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginTop: '1rem' }}>
          SEQUENCE PROGRESS: {sequence.length} / {SEQUENCE_LENGTH}
        </div>
      )}
    </div>
  );
}
