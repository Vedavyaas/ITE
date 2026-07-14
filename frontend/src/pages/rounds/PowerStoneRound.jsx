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
      <div className="card fade-in" style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(180deg, rgba(10,18,30,1) 0%, rgba(0,20,40,0.9) 100%)', border: '1px solid rgba(0,212,255,0.1)' }}>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', color: '#00d4ff', marginBottom: '1rem', letterSpacing: '2px' }}>
          Stark Industries: Arc Reactor Lab
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '1rem', lineHeight: '1.6' }}>
          The Power Stone's raw energy has destabilised Tony Stark's Mark L Arc Reactor core. The reactor's resonance wave field is oscillating wildly. To prevent a catastrophic meltdown, you must manually inject energy pulses at the correct wave peaks.
        </p>
        <p style={{ color: '#7dd3fc', marginBottom: '2rem', fontStyle: 'italic', fontSize: '1rem' }}>
          Watch the scrolling wave on the oscilloscope. Click precisely on the glowing peak zones — the high points of the wave — to charge the reactor. Mis-clicks drain resonance. Fill to 100% before time runs out.
        </p>
        <button className="btn btn-primary" style={{ background: 'rgba(0,212,255,0.15)', borderColor: '#00d4ff', color: '#00d4ff' }} onClick={handleStartCountdown}>
          Initialize Calibration
        </button>
      </div>
    );
  }

  if (phase === 'countdown') {
    return (
      <div className="card fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(0,10,25,0.9)' }}>
        <div style={{ fontSize: '0.7rem', color: '#00d4ff', letterSpacing: '4px', marginBottom: '1rem', fontFamily: "'Rajdhani', sans-serif" }}>REACTOR BOOT SEQUENCE</div>
        <h1 style={{ 
          fontSize: '6rem', 
          fontFamily: "'Rajdhani', sans-serif", 
          color: '#00d4ff',
          textShadow: '0 0 30px rgba(0,212,255,0.8)',
          margin: 0,
          animation: 'pulse-success 1s infinite'
        }}>
          {countdown}
        </h1>
        <p style={{ color: 'var(--silver)', fontSize: '1.1rem', marginTop: '1.5rem' }}>
          Wave field stabilizing. Watch for&nbsp;
          <span style={{ color: '#00ffaa', fontWeight: 700 }}>glowing peaks ▲</span>&nbsp;— click them precisely.
        </p>
      </div>
    );
  }

  if (phase === 'failed') {
    return (
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', border: '1px solid #ef4444', background: 'rgba(239,68,68,0.05)' }}>
        <h2 style={{ fontSize: '2rem', color: '#ef4444', marginBottom: '1rem', textShadow: '0 0 15px rgba(239,68,68,0.5)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '2px' }}>
          REACTOR DESTABILIZED
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '0.75rem' }}>
          Irregular pulse patterns caused a resonance cascade failure. The Arc Reactor has initiated an emergency shutdown.
        </p>
        <p style={{ color: '#fca5a5', fontStyle: 'italic', marginBottom: '2rem', fontSize: '0.95rem' }}>
          "Frequency drift detected. Recalibration required." — J.A.R.V.I.S.
        </p>
        <button className="btn" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={handleRetry}>
          Restart Calibration
        </button>
      </div>
    );
  }

  if (phase === 'won') {
    return (
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', background: 'linear-gradient(180deg, rgba(0,10,25,1) 0%, rgba(0,20,40,0.9) 100%)', border: '1px solid rgba(0,212,255,0.3)' }}>
        <HexStoneIcon size={80} color={stoneColor} glow={stoneGlow} />
        <h2 style={{ fontSize: '1.8rem', color: '#00d4ff', marginTop: '1.5rem', marginBottom: '0.75rem', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '2px' }}>
          Arc Reactor Calibrated
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '0.75rem', lineHeight: '1.6' }}>
          Remarkable precision, Agent. Frequency lock established at 1.20 Hz. The reactor is now channelling the Power Stone's energy at peak efficiency.
        </p>
        <p style={{ color: '#7dd3fc', fontStyle: 'italic', marginBottom: '2rem', fontSize: '0.95rem' }}>
          "Resonance stabilized. Power output nominal. Nice work." — J.A.R.V.I.S.
        </p>
        {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}
        <button 
          className="btn btn-primary"
          onClick={handleCompleteRound}
          disabled={loading}
          style={{ background: 'rgba(0,212,255,0.15)', borderColor: '#00d4ff', color: '#00d4ff' }}
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
