import { useState } from 'react';
import PathfinderGame from '../../components/PathfinderGame.jsx';
import HexStoneIcon from '../../components/HexStoneIcon.jsx';
import { updateSubRound, updateRound } from '../../api/client';

export default function SpaceStoneRound({ onComplete, stoneColor, stoneGlow }) {
  const [stageComplete, setStageComplete] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGameComplete = () => {
    setStageComplete(true);
  };

  const handleReset = () => {
    setStageComplete(false);
  };

  const handleCompleteRound = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      // User asked for sub-round and round logic to be similar, so we update both
      await updateSubRound('ONE');
      await updateRound('SECOND');
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
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <HexStoneIcon size={80} color={stoneColor} glow={stoneGlow} />
        <h2 style={{ fontSize: '1.8rem', color: stoneColor, marginTop: '1.5rem', marginBottom: '1rem' }}>
          Space Stone Secured
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Navigation telemetry confirmed. The Space Stone is locked into our coordinates.
        </p>
      </div>
    );
  }

  return (
    <div className="card fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', color: 'var(--white)', marginBottom: '0.5rem' }}>
        Tesseract Navigation (6x6)
      </h2>
      <p style={{ color: 'var(--silver)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Chart the absolute shortest path from Source (S) to Destination (D) while avoiding cosmic anomalies (✖).
      </p>

      {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}

      {!stageComplete ? (
        <PathfinderGame 
          onComplete={handleGameComplete} 
          onResetClick={handleReset} 
        />
      ) : (
        <div className="fade-in" style={{ marginTop: '2rem', padding: '2.5rem', background: 'rgba(59,130,246,0.1)', border: '1px solid var(--space)', borderRadius: '8px' }}>
          <h3 style={{ color: '#93c5fd', marginBottom: '1.5rem', fontSize: '1.3rem' }}>Optimal Route Confirmed!</h3>
          <HexStoneIcon size={64} color={stoneColor} glow={stoneGlow} />
          
          <div style={{ marginTop: '2rem' }}>
            <button 
              className="btn btn-primary"
              onClick={handleCompleteRound}
              disabled={loading}
              style={{ width: '100%', maxWidth: '300px' }}
            >
              {loading ? 'Transmitting...' : 'Save & Complete Mission'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
