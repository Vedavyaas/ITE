import { useState, useEffect } from 'react';
import MemoryGame from '../../components/MemoryGame.jsx';
import HexStoneIcon from '../../components/HexStoneIcon.jsx';
import { getAckSubRound, updateSubRound, updateRound } from '../../api/client';

export default function MindStoneRound({ onComplete, stoneColor, stoneGlow }) {
  const [currentStage, setCurrentStage] = useState('checking'); // checking, one, two, done
  const [stageComplete, setStageComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    checkProgress();
  }, []);

  const checkProgress = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      // If they finished ONE, they can access TWO.
      // If they haven't finished YET_TO_START, they can't even access ONE (but dashboard already gated FIRST round).
      // Let's check if they have access to TWO (meaning ONE is completed)
      const hasAccessToTwo = await getAckSubRound('TWO');
      if (hasAccessToTwo) {
        setCurrentStage('two');
      } else {
        // Fallback to one
        setCurrentStage('one');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sync with command center.');
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = () => {
    setStageComplete(true);
  };

  const handleReset = () => {
    setStageComplete(false);
  };

  const handleSaveSubRoundOne = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await updateSubRound('ONE');
      setCurrentStage('two');
      setStageComplete(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save progress.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSubRoundTwo = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await updateSubRound('TWO');
      await updateRound('FIRST');
      if (onComplete) onComplete();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save progress.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRound = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await updateRound('FIRST');
      if (onComplete) onComplete();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to complete mission.');
    } finally {
      setLoading(false);
    }
  };

  if (currentStage === 'checking') {
    return (
      <div className="card fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
        <p className="spinner-text">Syncing Neural Link...</p>
      </div>
    );
  }

  if (currentStage === 'done') {
    return (
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <HexStoneIcon size={80} color={stoneColor} glow={stoneGlow} />
        <h2 style={{ fontSize: '1.8rem', color: 'var(--mind)', marginTop: '1.5rem', marginBottom: '1rem' }}>
          Mind Stone Secured
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Excellent work, Agent. The cognitive grid has been stabilized. The Mind Stone is now under S.H.I.E.L.D. protection.
        </p>
        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
        <button 
          className="btn btn-primary" 
          onClick={handleCompleteRound}
          disabled={loading}
        >
          {loading ? 'Transmitting...' : 'Upload Data & Return to Dashboard'}
        </button>
      </div>
    );
  }

  const isGridTwo = currentStage === 'two';
  const gridSize = isGridTwo ? 5 : 4;

  return (
    <div className="card fade-in" style={{ padding: 'clamp(1rem, 3.5vw, 2rem)', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', padding: '0.2rem 0.75rem', borderRadius: '16px', background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)', color: '#fde047', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
        {isGridTwo ? 'Sub-Round 2 of 2' : 'Sub-Round 1 of 2'}
      </div>
      <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)', color: 'var(--white)', marginBottom: '0.4rem' }}>
        {isGridTwo ? 'Sector B-Alpha (5x5 Grid)' : 'Sector A-Prime (4x4 Grid)'}
      </h2>
      <p style={{ color: 'var(--silver)', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
        {isGridTwo
          ? 'Flip any two tiles at a time to reveal symbols. Match all 12 pairs in the 5x5 grid to secure the Mind Stone.'
          : 'Flip any two tiles at a time to reveal symbols. Match all 8 identical pairs to stabilize this sector and unlock Sector B.'}
      </p>

      {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}

      <MemoryGame 
        gridSize={gridSize} 
        onComplete={handleGameComplete} 
        onResetClick={handleReset} 
      />

      {stageComplete && (
        <div className="fade-in" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(22,197,94,0.1)', border: '1px solid var(--time)', borderRadius: '8px' }}>
          <h3 style={{ color: '#86efac', marginBottom: '1rem', fontSize: '1.1rem' }}>Grid Stabilized!</h3>
          <button 
            className="btn btn-primary"
            onClick={isGridTwo ? handleSaveSubRoundTwo : handleSaveSubRoundOne}
            disabled={loading}
            style={{ width: '100%', maxWidth: '300px' }}
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      )}
    </div>
  );
}
