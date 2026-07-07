import { useState } from 'react';
import SpotTheDifferenceGame from '../../components/SpotTheDifferenceGame.jsx';
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
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <HexStoneIcon size={80} color={stoneColor} glow={stoneGlow} />
        <h2 style={{ fontSize: '1.8rem', color: stoneColor, marginTop: '1.5rem', marginBottom: '1rem' }}>
          Reality Stone Secured
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Reality distortions neutralized. The Reality Stone is locked into our coordinates.
        </p>
      </div>
    );
  }

  return (
    <div className="card fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', color: 'var(--white)', marginBottom: '0.5rem' }}>
        Reality Distortion Detection
      </h2>
      <p style={{ color: 'var(--silver)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Compare the original visual telemetry with the altered reality. Find the 3 anomalies and tap them to stabilize the region.
      </p>

      {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}

      {!stageComplete ? (
        <SpotTheDifferenceGame 
          baseImage="/reality_control_room.png" 
          onComplete={handleGameComplete} 
        />
      ) : (
        <div className="fade-in" style={{ marginTop: '2rem', padding: '2.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--reality)', borderRadius: '8px' }}>
          <h3 style={{ color: '#fca5a5', marginBottom: '1.5rem', fontSize: '1.3rem' }}>Anomalies Purged!</h3>
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
