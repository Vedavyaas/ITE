import { useState } from 'react';
import RealityCipherGame from '../../components/RealityCipherGame.jsx';
import HexStoneIcon from '../../components/HexStoneIcon.jsx';
import { updateSubRound, updateRound } from '../../api/client';

export default function RealityStoneRound({ onComplete, stoneColor, stoneGlow }) {
  const [stageComplete, setStageComplete] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGameComplete = () => {
    setStageComplete(true);
  };

  const handleCompleteRound = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await updateSubRound('ONE');
      await updateRound('THIRD');
      setIsDone(true);
      if (onComplete) onComplete();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to complete mission.');
    } finally {
      setLoading(false);
    }
  };

  if (isDone) {
    return (
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', background: 'linear-gradient(180deg, rgba(20,5,5,1) 0%, rgba(30,5,5,0.9) 100%)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <HexStoneIcon size={80} color={stoneColor} glow={stoneGlow} />
        <h2 style={{ fontSize: '1.8rem', color: stoneColor, marginTop: '1.5rem', marginBottom: '1rem', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '2px' }}>
          Reality Stone Secured
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '0.75rem', lineHeight: '1.6' }}>
          Cipher decoded. Aether encryption neutralised. The Reality Stone's lock sequence has been broken and the Stone is now secured.
        </p>
        <p style={{ color: '#fca5a5', fontStyle: 'italic', marginBottom: '2rem', fontSize: '0.95rem' }}>
          "Reality is often disappointing. That is, it was. Now... reality can be whatever I want." — Thanos
        </p>
      </div>
    );
  }

  return (
    <div className="card fade-in" style={{ padding: '2rem', background: 'rgba(20,5,5,0.8)' }}>
      <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', color: '#ef4444', marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '2px' }}>
        Aether Cipher Intercept
      </h2>
      <p style={{ color: 'var(--silver)', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.6' }}>
        The Reality Stone masked its unlock code in an encrypted 4-byte payload. Decode the Aether cipher and enter the correct sequence to claim the Stone.
      </p>

      {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}

      {!stageComplete ? (
        <RealityCipherGame onComplete={handleGameComplete} />
      ) : (
        <div className="fade-in" style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
          <h3 style={{ color: '#fca5a5', marginBottom: '0.5rem', fontSize: '1.2rem', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '2px' }}>
            CIPHER DECODED — ACCESS GRANTED
          </h3>
          <p style={{ color: 'var(--silver)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            The Aether encryption layer has been cracked. Reality Stone lock sequence accepted.
          </p>
          <HexStoneIcon size={56} color={stoneColor} glow={stoneGlow} />
          <div style={{ marginTop: '1.5rem' }}>
            <button
              className="btn btn-primary"
              onClick={handleCompleteRound}
              disabled={loading}
              style={{ width: '100%', maxWidth: '320px', borderColor: '#ef4444', background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
            >
              {loading ? 'Transmitting...' : 'Save & Complete Mission'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
