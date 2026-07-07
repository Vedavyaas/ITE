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
  const gridSize = isGridTwo ? 6 : 4;

  return (
    <div className="card fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', color: 'var(--white)', marginBottom: '0.5rem' }}>
        Sector {isGridTwo ? 'B-Alpha (6x6)' : 'A-Prime (4x4)'}
      </h2>
      <p style={{ color: 'var(--silver)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Match the anomalous energy signatures to stabilize the grid.
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
