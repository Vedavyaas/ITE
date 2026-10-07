import { useState } from 'react';
import TimeStoneGame from '../../components/TimeStoneGame.jsx';
import HexStoneIcon from '../../components/HexStoneIcon.jsx';
import { updateSubRound, updateRound } from '../../api/client';

export default function TimeStoneRound({ onComplete, stoneColor, stoneGlow }) {
  // phases: 'intro', 'playing', 'failed', 'won'
  const [phase, setPhase] = useState('intro');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStart = () => {
    setPhase('playing');
  };

  const handleWin = () => {
    setPhase('won');
  };

  const handleFail = () => {
    setPhase('failed');
  };

  const handleRetry = () => {
    setPhase('playing');
  };

  const handleCompleteRound = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await updateSubRound('ONE');
      await updateRound('FIFTH');
      if (onComplete) onComplete();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to complete mission.');
      setLoading(false);
    }
  };

  if (phase === 'intro') {
    return (
      <div className="card fade-in" style={{
        padding: 'clamp(1.25rem, 4vw, 2.25rem)',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(8,24,14,0.95) 0%, rgba(5,15,9,0.95) 100%)',
        border: '1px solid rgba(34,197,94,0.25)',
        maxWidth: '560px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 'clamp(1.35rem, 4.5vw, 1.75rem)',
          color: '#22c55e',
          marginBottom: '0.25rem',
          letterSpacing: '2px',
          fontWeight: 700,
        }}>
          The Time Loop
        </h2>
        <div style={{
          fontSize: '0.65rem',
          color: 'rgba(34,197,94,0.75)',
          letterSpacing: '2px',
          marginBottom: '1rem',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          Sacred Timeline Synchronization
        </div>

        <p style={{
          color: 'var(--silver)',
          fontSize: 'clamp(0.85rem, 2.8vw, 0.95rem)',
          lineHeight: '1.6',
          marginBottom: '1rem',
        }}>
          The Sacred Timeline has fractured. Memorize and repeat the sequence of flashing Infinity Stones. Complete all 12 steps without error to claim the Time Stone.
        </p>

        <p style={{
          color: '#86efac',
          fontStyle: 'italic',
          fontSize: 'clamp(0.9rem, 2.8vw, 1.05rem)',
          margin: '0 auto 1.5rem',
          letterSpacing: '0.5px',
        }}>
          "Dormammu, I've come to bargain..." — Doctor Strange
        </p>

        <button
          className="btn btn-primary"
          style={{
            width: '100%',
            maxWidth: '300px',
            margin: '0 auto',
            display: 'block',
            background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
            border: 'none',
            color: '#fff',
            fontSize: '0.95rem',
            letterSpacing: '2px',
            boxShadow: '0 4px 16px rgba(34,197,94,0.35)',
          }}
          onClick={handleStart}
        >
          ⏳ Enter the Time Loop
        </button>
      </div>
    );
  }

  if (phase === 'failed') {
    return (
      <div className="card fade-in" style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        border: '1px solid #ef4444',
        background: 'rgba(239,68,68,0.06)',
        maxWidth: '520px',
        margin: '0 auto',
      }}>
        <h2 style={{ fontSize: '1.6rem', color: '#ef4444', marginBottom: '0.5rem', letterSpacing: '2px', fontFamily: "'Rajdhani', sans-serif" }}>
          TIMELINE COLLAPSE DETECTED
        </h2>
        <p style={{ color: 'var(--silver)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          Sequence mismatch broke chronological stability. The time loop has collapsed.
        </p>
        <p style={{ color: '#fca5a5', fontStyle: 'italic', marginBottom: '1.75rem', fontSize: '0.88rem' }}>
          "Dormammu, I've come to bargain..." — Doctor Strange
        </p>
        <button
          className="btn"
          style={{ borderColor: '#ef4444', color: '#ef4444', width: '100%', maxWidth: '240px', margin: '0 auto' }}
          onClick={handleRetry}
        >
          ↻ Re-enter Time Loop
        </button>
      </div>
    );
  }

  if (phase === 'won') {
    return (
      <div className="card fade-in" style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(8,24,14,0.95) 0%, rgba(5,15,9,0.95) 100%)',
        border: '1px solid rgba(34,197,94,0.35)',
        maxWidth: '560px',
        margin: '0 auto',
      }}>
        <HexStoneIcon size={80} color={stoneColor} glow={stoneGlow} />
        <h2 style={{ fontSize: '1.8rem', color: stoneColor, marginTop: '1.5rem', marginBottom: '0.75rem', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '2px' }}>
          Time Stone Secured
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '0.75rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
          The Sacred Timeline has been stabilized. All 12 chronological anchors successfully locked. The Time Stone is now under your squad's control.
        </p>
        <p style={{ color: '#86efac', fontStyle: 'italic', marginBottom: '2rem', fontSize: '0.9rem' }}>
          "We're in the endgame now." — Doctor Strange
        </p>
        {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}
        <button 
          className="btn btn-primary"
          onClick={handleCompleteRound}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
            border: 'none',
            color: '#fff',
            width: '100%',
            maxWidth: '320px',
            margin: '0 auto',
            letterSpacing: '2px',
          }}
        >
          {loading ? 'Transmitting...' : 'Save & Complete Mission'}
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '1rem' }}>
      <TimeStoneGame onWin={handleWin} onFail={handleFail} />
    </div>
  );
}
