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
      <div className="card fade-in" style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(180deg, rgba(10,18,30,1) 0%, rgba(0,20,40,0.9) 100%)', border: '1px solid rgba(168,85,247,0.15)' }}>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', color: '#a855f7', marginBottom: '1rem', letterSpacing: '2px' }}>
          Stark Industries: Arc Reactor Lab
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '1rem', lineHeight: '1.6' }}>
          The Power Stone has overloaded Tony Stark's Arc Reactor, throwing its harmonic field into chaos. The reactor's waveform no longer matches the target resonance signature — and without a lock, it will destabilise.
        </p>
        <p style={{ color: '#c084fc', marginBottom: '2rem', fontStyle: 'italic', fontSize: '1rem' }}>
          Use the three sliders — <strong style={{ color: '#fff' }}>Frequency</strong>, <strong style={{ color: '#fff' }}>Phase</strong>, and <strong style={{ color: '#fff' }}>Amplitude</strong> — to tune your waveform until it overlaps the target signal. Hold above 88% match for 3 seconds to achieve resonance lock.
        </p>
        <button className="btn btn-primary" style={{ background: 'rgba(168,85,247,0.15)', borderColor: '#a855f7', color: '#a855f7' }} onClick={handleStartCountdown}>
          Initialize Calibration
        </button>
      </div>
    );
  }

  if (phase === 'countdown') {
    return (
      <div className="card fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(0,10,25,0.9)' }}>
        <div style={{ fontSize: '0.7rem', color: '#a855f7', letterSpacing: '4px', marginBottom: '1rem', fontFamily: "'Rajdhani', sans-serif" }}>REACTOR BOOT SEQUENCE</div>
        <h1 style={{ 
          fontSize: '6rem', 
          fontFamily: "'Rajdhani', sans-serif", 
          color: '#a855f7',
          margin: 0,
          animation: 'pulse-success 1s infinite'
        }}>
          {countdown}
        </h1>
        <p style={{ color: 'var(--silver)', fontSize: '1rem', marginTop: '1.5rem' }}>
          Tune <span style={{ color: '#c084fc', fontWeight: 700 }}>Frequency</span>,&nbsp;
          <span style={{ color: '#c084fc', fontWeight: 700 }}>Phase</span> and&nbsp;
          <span style={{ color: '#c084fc', fontWeight: 700 }}>Amplitude</span> to match the target waveform.
        </p>
      </div>
    );
  }

  if (phase === 'failed') {
    return (
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', border: '1px solid #ef4444', background: 'rgba(239,68,68,0.05)' }}>
        <h2 style={{ fontSize: '2rem', color: '#ef4444', marginBottom: '1rem', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '2px' }}>
          RESONANCE LOCK FAILED
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '0.75rem' }}>
          Time expired before the waveform could lock onto the target signature. The reactor's parameters drifted too far off resonance.
        </p>
        <p style={{ color: '#fca5a5', fontStyle: 'italic', marginBottom: '2rem', fontSize: '0.95rem' }}>
          "Signal mismatch exceeded tolerance. Recalibration required." — J.A.R.V.I.S.
        </p>
        <button className="btn" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={handleRetry}>
          Restart Calibration
        </button>
      </div>
    );
  }

  if (phase === 'won') {
    return (
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', background: 'linear-gradient(180deg, rgba(10,5,25,1) 0%, rgba(20,0,40,0.9) 100%)', border: '1px solid rgba(168,85,247,0.3)' }}>
        <HexStoneIcon size={80} color={stoneColor} glow={stoneGlow} />
        <h2 style={{ fontSize: '1.8rem', color: '#a855f7', marginTop: '1.5rem', marginBottom: '0.75rem', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '2px' }}>
          Resonance Lock Achieved
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '0.75rem', lineHeight: '1.6' }}>
          Outstanding calibration, Agent. Waveform locked at 1.20 Hz with full amplitude and zero phase drift. The reactor is now channelling the Power Stone's energy at peak efficiency.
        </p>
        <p style={{ color: '#c084fc', fontStyle: 'italic', marginBottom: '2rem', fontSize: '0.95rem' }}>
          "All parameters nominal. Resonance lock confirmed. Power Stone contained." — J.A.R.V.I.S.
        </p>
        {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}
        <button 
          className="btn btn-primary"
          onClick={handleCompleteRound}
          disabled={loading}
          style={{ background: 'rgba(168,85,247,0.15)', borderColor: '#a855f7', color: '#a855f7' }}
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
