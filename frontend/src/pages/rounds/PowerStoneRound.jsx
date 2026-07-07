import { useState, useEffect } from 'react';
import PowerCoreGame from '../../components/PowerCoreGame.jsx';
import HexStoneIcon from '../../components/HexStoneIcon.jsx';
import { updateSubRound, updateRound } from '../../api/client';

export default function PowerStoneRound({ onComplete, stoneColor, stoneGlow }) {
  // phases: 'intro', 'countdown', 'playing', 'failed', 'won'
  const [phase, setPhase] = useState('intro');
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle countdown effect
  useEffect(() => {
    let timer;
    if (phase === 'countdown') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        setPhase('playing');
      }
    }
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  const handleStartCountdown = () => {
    setCountdown(5);
    setPhase('countdown');
  };

  const handleWin = () => {
    setPhase('won');
  };

  const handleFail = () => {
    setPhase('failed');
  };

  const handleRetry = () => {
    handleStartCountdown();
  };

  const handleCompleteRound = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await updateSubRound('ONE');
      await updateRound('FOURTH');
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
          Nidavellir Forge: Stormbreaker
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '1rem', lineHeight: '1.6' }}>
          To forge the ultimate weapon, you need the heat of a dying star. The mechanism is broken—you must manually pull and hold the forge's iris open!
        </p>
        <p style={{ color: '#fca5a5', marginBottom: '2rem', fontStyle: 'italic' }}>
          Warning: The star's energy creates massive resistance. Mash the PULL button to force the iris open and hold it steady until the Uru metal melts.
        </p>
        <button className="btn btn-primary" onClick={handleStartCountdown}>
          Awaken the Forge
        </button>
      </div>
    );
  }

  if (phase === 'countdown') {
    return (
      <div className="card fade-in" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '6rem', 
          fontFamily: "'Rajdhani', sans-serif", 
          color: 'var(--power)',
          textShadow: '0 0 30px rgba(168,85,247,0.8)',
          margin: 0,
          animation: 'pulse-success 1s infinite'
        }}>
          {countdown}
        </h1>
        <p style={{ color: 'var(--silver)', fontSize: '1.2rem', marginTop: '1rem' }}>
          Prepare to pull with everything you have. Do not let the iris snap shut.
        </p>
      </div>
    );
  }

  if (phase === 'failed') {
    return (
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', border: '1px solid #ef4444', background: 'rgba(239,68,68,0.05)' }}>
        <h2 style={{ fontSize: '2rem', color: '#ef4444', marginBottom: '1rem', textShadow: '0 0 15px rgba(239,68,68,0.5)' }}>
          FORGE COLLAPSED
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '2rem' }}>
          The star's energy overwhelmed you. The iris snapped shut and the metal cooled.
        </p>
        <button className="btn" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={handleRetry}>
          Try Again
        </button>
      </div>
    );
  }

  if (phase === 'won') {
    return (
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <HexStoneIcon size={80} color={stoneColor} glow={stoneGlow} />
        <h2 style={{ fontSize: '1.8rem', color: stoneColor, marginTop: '1.5rem', marginBottom: '1rem' }}>
          Stormbreaker Forged
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Incredible strength, Agent! The Uru metal is melted and the weapon is complete.
        </p>
        {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}
        <button 
          className="btn btn-primary"
          onClick={handleCompleteRound}
          disabled={loading}
        >
          {loading ? 'Transmitting...' : 'Save & Complete Mission'}
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '1rem' }}>
      <PowerCoreGame onWin={handleWin} onFail={handleFail} />
    </div>
  );
}
