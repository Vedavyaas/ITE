import { useState } from 'react';
import PathfinderGame from '../../components/PathfinderGame.jsx';
import HexStoneIcon from '../../components/HexStoneIcon.jsx';
import { updateSubRound, updateRound } from '../../api/client';

export default function SpaceStoneRound({ onComplete, stoneColor, stoneGlow }) {
  const [subRoundStage, setSubRoundStage] = useState(1);
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

  const handleProceedStage1 = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await updateSubRound('ONE');
      setSubRoundStage(2);
      setStageComplete(false); // Reset for the next stage
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save sub-round progress.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRound = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await updateSubRound('TWO');
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
    <div className="card fade-in" style={{ padding: 'clamp(1rem, 3.5vw, 2rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', padding: '0.2rem 0.75rem', borderRadius: '16px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
        {subRoundStage === 1 ? 'Sub-Round 1 of 2' : 'Sub-Round 2 of 2'}
      </div>
      <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)', color: 'var(--white)', marginBottom: '0.4rem' }}>
        {subRoundStage === 1 ? 'Tesseract Grid: Sector Alpha (5x5)' : 'Tesseract Grid: Sector Omega (7x7)'}
      </h2>
      <p style={{ color: 'var(--silver)', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
        {subRoundStage === 1
          ? 'Tap adjacent cells starting from S to chart a path to D. You must find the route with the absolute lowest total energy sum to unlock Sector Omega.'
          : 'Grid expanded! Calculate and navigate the optimal minimum-energy route from S to D to claim the Space Stone.'}
      </p>

      {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}

      {!stageComplete ? (
        subRoundStage === 1 ? (
          <PathfinderGame
            key="stage1"
            rows={5}
            cols={5}
            src={{ r: 0, c: 0 }}
            dest={{ r: 4, c: 4 }}
            onComplete={handleGameComplete}
            onResetClick={handleReset}
          />
        ) : (
          <PathfinderGame
            key="stage2"
            rows={7}
            cols={7}
            src={{ r: 0, c: 0 }}
            dest={{ r: 6, c: 6 }}
            onComplete={handleGameComplete}
            onResetClick={handleReset}
          />
        )
      ) : (
        <div className="fade-in" style={{ marginTop: '2rem', padding: '2.5rem', background: 'rgba(59,130,246,0.1)', border: '1px solid var(--space)', borderRadius: '8px' }}>
          <h3 style={{ color: '#93c5fd', marginBottom: '1.5rem', fontSize: '1.3rem' }}>Optimal Route Confirmed!</h3>
          <HexStoneIcon size={64} color={stoneColor} glow={stoneGlow} />

          <div style={{ marginTop: '2rem' }}>
            {subRoundStage === 1 ? (
              <button
                className="btn btn-primary"
                onClick={handleProceedStage1}
                disabled={loading}
                style={{ width: '100%', maxWidth: '300px' }}
              >
                {loading ? 'Transmitting...' : 'Proceed to Next Sector'}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleCompleteRound}
                disabled={loading}
                style={{ width: '100%', maxWidth: '300px' }}
              >
                {loading ? 'Transmitting...' : 'Save & Complete Mission'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
