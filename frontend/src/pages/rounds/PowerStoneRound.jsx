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
      <div className="card fade-in" style={{
        padding: 'clamp(1.25rem, 4vw, 2.25rem)',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(12,18,32,0.95) 0%, rgba(8,12,24,0.95) 100%)',
        border: '1px solid rgba(168,85,247,0.22)',
        maxWidth: '580px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 'clamp(1.35rem, 4.5vw, 1.75rem)',
          color: '#a855f7',
          marginBottom: '0.25rem',
          letterSpacing: '2px',
          fontWeight: 700,
        }}>
          Arc Reactor Calibration
        </h2>
        <div style={{
          fontSize: '0.65rem',
          color: 'rgba(168,85,247,0.7)',
          letterSpacing: '2px',
          marginBottom: '1rem',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          Harmonic Resonance Alignment
        </div>

        <p style={{
          color: 'var(--silver)',
          fontSize: 'clamp(0.85rem, 2.8vw, 0.95rem)',
          lineHeight: '1.5',
          marginBottom: '1.25rem',
        }}>
          Adjust the Frequency, Phase Offset, and Amplitude sliders until your live waveform matches the target resonance signature.
        </p>

        {/* 3 Step Instruction Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          textAlign: 'left',
        }}>
          <div style={{
            background: 'rgba(0,255,170,0.05)',
            border: '1px solid rgba(0,255,170,0.2)',
            borderRadius: '8px',
            padding: '0.75rem',
          }}>
            <div style={{ fontSize: '0.62rem', color: '#00ffaa', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.25rem' }}>
              1. TUNE SLIDERS
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--silver)', lineHeight: '1.4' }}>
              Adjust <strong style={{ color: '#00ffaa' }}>Frequency</strong>, <strong style={{ color: '#00d4ff' }}>Phase</strong>, and <strong style={{ color: '#a855f7' }}>Amplitude</strong>.
            </div>
          </div>

          <div style={{
            background: 'rgba(0,212,255,0.05)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '8px',
            padding: '0.75rem',
          }}>
            <div style={{ fontSize: '0.62rem', color: '#00d4ff', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.25rem' }}>
              2. REACH ≥ 88%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--silver)', lineHeight: '1.4' }}>
              Align the curves until signal correlation hits <strong style={{ color: '#fff' }}>88% or higher</strong>.
            </div>
          </div>

          <div style={{
            background: 'rgba(168,85,247,0.05)',
            border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: '8px',
            padding: '0.75rem',
          }}>
            <div style={{ fontSize: '0.62rem', color: '#a855f7', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.25rem' }}>
              3. HOLD 5 SECONDS
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--silver)', lineHeight: '1.4' }}>
              Hold steady for <strong style={{ color: '#fff' }}>5 seconds</strong> before the 60s timer expires.
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{
            width: '100%',
            maxWidth: '320px',
            margin: '0 auto',
            display: 'block',
            background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
            border: 'none',
            color: '#fff',
            fontSize: '0.95rem',
            letterSpacing: '2px',
            boxShadow: '0 4px 16px rgba(168,85,247,0.35)',
          }}
          onClick={handleStartCountdown}
        >
          ⚡ Begin Calibration
        </button>
      </div>
    );
  }

  if (phase === 'countdown') {
    return (
      <div className="card fade-in" style={{
        padding: 'clamp(2.5rem, 8vw, 4rem) 1.5rem',
        textAlign: 'center',
        background: 'rgba(0,10,25,0.92)',
        maxWidth: '520px',
        margin: '0 auto',
        border: '1px solid rgba(168,85,247,0.2)',
      }}>
        <div style={{
          fontSize: '0.65rem',
          color: '#a855f7',
          letterSpacing: '3px',
          marginBottom: '0.85rem',
          fontWeight: 700,
        }}>
          REACTOR INITIALIZING
        </div>
        <h1 style={{
          fontSize: 'clamp(4.5rem, 16vw, 6.5rem)',
          fontFamily: "'Rajdhani', sans-serif",
          color: '#a855f7',
          margin: '0 0 1rem 0',
          lineHeight: 1,
          animation: 'pulse-success 1s infinite',
        }}>
          {countdown}
        </h1>
        <p style={{
          color: 'var(--silver)',
          fontSize: 'clamp(0.85rem, 2.8vw, 0.95rem)',
          maxWidth: '380px',
          margin: '0 auto',
          lineHeight: '1.4',
        }}>
          Tune <span style={{ color: '#00ffaa', fontWeight: 700 }}>Frequency</span>, <span style={{ color: '#00d4ff', fontWeight: 700 }}>Phase</span>, and <span style={{ color: '#a855f7', fontWeight: 700 }}>Amplitude</span>.
        </p>
      </div>
    );
  }

  if (phase === 'failed') {
    return (
      <div className="card fade-in" style={{
        padding: 'clamp(2rem, 6vw, 3rem) clamp(1rem, 4vw, 2rem)',
        textAlign: 'center',
        border: '1px solid #ef4444',
        background: 'rgba(239,68,68,0.05)',
        maxWidth: '560px',
        margin: '0 auto',
      }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: '#ef4444', marginBottom: '1rem', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '2px' }}>
          RESONANCE LOCK FAILED
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
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
      <div className="card fade-in" style={{
        padding: 'clamp(2rem, 6vw, 3rem) clamp(1rem, 4vw, 2rem)',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(10,5,25,1) 0%, rgba(20,0,40,0.9) 100%)',
        border: '1px solid rgba(168,85,247,0.3)',
        maxWidth: '560px',
        margin: '0 auto',
      }}>
        <HexStoneIcon size={80} color={stoneColor} glow={stoneGlow} />
        <h2 style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', color: '#a855f7', marginTop: '1.5rem', marginBottom: '0.75rem', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '2px' }}>
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
    <div className="fade-in" style={{ padding: 'clamp(0.25rem, 2vw, 0.75rem) 0' }}>
      <PowerCoreGame onWin={handleWin} onFail={handleFail} />
    </div>
  );
}
