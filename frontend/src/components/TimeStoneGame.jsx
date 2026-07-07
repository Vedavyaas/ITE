import { useState, useEffect } from 'react';

const EVENTS = [
  { id: 1, text: "The Avengers defeat Ultron in Sokovia" },
  { id: 2, text: "Doctor Strange surrenders the Time Stone to Thanos" },
  { id: 3, text: "Thor strikes Thanos in the chest with Stormbreaker" },
  { id: 4, text: "Thanos snaps his fingers (The Decimation)" },
  { id: 5, text: "Wanda confronts Thanos for revenge ('You took everything from me')" },
  { id: 6, text: "Iron Man sacrifices himself to defeat Thanos" }
];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure it's not already sorted initially
  if (arr.every((e, i) => e.id === i + 1)) {
    return shuffleArray(arr);
  }
  return arr;
}

export default function TimeStoneGame({ onWin, onFail }) {
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    setTimeline(shuffleArray(EVENTS));
  }, []);

  const moveUp = (index) => {
    if (index === 0) return;
    const newTimeline = [...timeline];
    [newTimeline[index - 1], newTimeline[index]] = [newTimeline[index], newTimeline[index - 1]];
    setTimeline(newTimeline);
  };

  const moveDown = (index) => {
    if (index === timeline.length - 1) return;
    const newTimeline = [...timeline];
    [newTimeline[index + 1], newTimeline[index]] = [newTimeline[index], newTimeline[index + 1]];
    setTimeline(newTimeline);
  };

  const verifyTimeline = () => {
    const isCorrect = timeline.every((e, i) => e.id === i + 1);
    if (isCorrect) {
      if (onWin) onWin();
    } else {
      if (onFail) onFail();
    }
  };

  if (timeline.length === 0) return null;

  return (
    <div className="time-stone-container fade-in" style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <p style={{ color: 'var(--silver)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
        Sort the events by their <strong>Movie Release Order</strong>.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {timeline.map((event, idx) => (
          <div key={event.id} style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '0.75rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}>
            <div style={{ flex: 1, color: 'var(--white)', fontSize: '0.9rem', lineHeight: '1.4' }}>
              {event.text}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginLeft: '1rem' }}>
              <button 
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: idx === 0 ? 'rgba(255,255,255,0.2)' : 'var(--time)',
                  borderRadius: '4px',
                  padding: '0.25rem 0.75rem',
                  cursor: idx === 0 ? 'default' : 'pointer',
                  fontSize: '1.2rem',
                  lineHeight: 1
                }}
              >
                ▲
              </button>
              <button 
                onClick={() => moveDown(idx)}
                disabled={idx === timeline.length - 1}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: idx === timeline.length - 1 ? 'rgba(255,255,255,0.2)' : 'var(--time)',
                  borderRadius: '4px',
                  padding: '0.25rem 0.75rem',
                  cursor: idx === timeline.length - 1 ? 'default' : 'pointer',
                  fontSize: '1.2rem',
                  lineHeight: 1
                }}
              >
                ▼
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        className="btn btn-primary" 
        onClick={verifyTimeline}
        style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '2px', background: 'var(--time)', borderColor: 'var(--time)' }}
      >
        Verify Timeline
      </button>
    </div>
  );
}
