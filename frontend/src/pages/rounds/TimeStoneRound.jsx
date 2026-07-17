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
      <div className="card fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', color: 'var(--white)', marginBottom: '1rem' }}>
          Temporal Nexus: The Sacred Timeline
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '1rem', lineHeight: '1.6' }}>
          The Time Stone's containment has fractured the timeline. Key events are out of sequence, threatening to rip the universe apart.
        </p>
        <p style={{ color: 'var(--time)', marginBottom: '2rem', fontStyle: 'italic' }}>
          Mission: You must stabilize the time loop by repeating the exact sequence of events before it collapses.
        </p>
        <button className="btn btn-primary" style={{ background: 'var(--time)', borderColor: 'var(--time)' }} onClick={handleStart}>
          Enter the Nexus
        </button>
      </div>
    );
  }

  if (phase === 'failed') {
    return (
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', border: '1px solid #ef4444', background: 'rgba(239,68,68,0.05)' }}>
        <h2 style={{ fontSize: '2rem', color: '#ef4444', marginBottom: '1rem', textShadow: '0 0 15px rgba(239,68,68,0.5)' }}>
          TIMELINE BRANCH DETECTED
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '2rem' }}>
          The chronological sequence is incorrect. The timeline has collapsed and reset itself.
        </p>
        <button className="btn" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={handleRetry}>
          Re-enter Nexus
        </button>
      </div>
    );
  }

  if (phase === 'won') {
    return (
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <HexStoneIcon size={80} color={stoneColor} glow={stoneGlow} />
        <h2 style={{ fontSize: '1.8rem', color: stoneColor, marginTop: '1.5rem', marginBottom: '1rem' }}>
          Time Stone Secured
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Outstanding. The Sacred Timeline has been restored and the Time Stone is stable.
        </p>
        {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}
        <button 
          className="btn btn-primary"
          onClick={handleCompleteRound}
          disabled={loading}
          style={{ background: 'var(--time)', borderColor: 'var(--time)' }}
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
