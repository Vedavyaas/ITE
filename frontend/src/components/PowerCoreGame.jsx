import { useState, useEffect, useRef } from 'react';

const DURATION = 30; // 30 seconds to forge the weapon
const HOLD_REQUIRED = 5; // Must hold above 90% for 5 seconds
const TAP_POWER = 15; // Power added per tap (balanced to be manageable)
const DECAY_RATE = 10; // Power lost per second

export default function PowerCoreGame({ onWin, onFail }) {
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [power, setPower] = useState(0);
  const [holdTime, setHoldTime] = useState(0);

  const gameState = useRef({
    power: 0,
    holdTime: 0,
    timeLeft: DURATION,
    lastTime: null,
    status: 'playing' // playing, won, failed
  });

  const requestRef = useRef();
  const startTimeRef = useRef(null);

  const handleTap = () => {
    if (gameState.current.status !== 'playing') return;
    gameState.current.power += TAP_POWER;
    if (gameState.current.power > 100) gameState.current.power = 100;
  };

  const gameLoop = (time) => {
    if (gameState.current.status !== 'playing') return;
    
    if (gameState.current.lastTime === null) {
      gameState.current.lastTime = time;
      startTimeRef.current = time;
    }
    
    const dt = (time - gameState.current.lastTime) / 1000;
    gameState.current.lastTime = time;

    // Prevent massive jumps if tab inactive
    if (dt > 0.1) {
      requestRef.current = requestAnimationFrame(gameLoop);
      return; 
    }

    // Decay power
    if (gameState.current.power > 0) {
      // Small penalty: decay slightly faster when power is high
      const currentDecay = DECAY_RATE + (gameState.current.power * 0.05);
      gameState.current.power -= currentDecay * dt;
      if (gameState.current.power < 0) gameState.current.power = 0;
    }

    // Update hold time
    if (gameState.current.power >= 90) {
      gameState.current.holdTime += dt;
    } else {
      gameState.current.holdTime = 0;
    }

    // Update main timer
    gameState.current.timeLeft -= dt;

    // Check conditions
    if (gameState.current.holdTime >= HOLD_REQUIRED) {
      gameState.current.status = 'won';
      setPower(gameState.current.power);
      setHoldTime(HOLD_REQUIRED);
      if (onWin) onWin();
      return;
    }

    if (gameState.current.timeLeft <= 0) {
      gameState.current.status = 'failed';
      setTimeLeft(0);
      if (onFail) onFail();
      return;
    }

    // Force re-render with new state
    setPower(gameState.current.power);
    setHoldTime(gameState.current.holdTime);
    setTimeLeft(gameState.current.timeLeft);

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inForgeZone = power >= 90;
  const holdPercentage = Math.min(100, (holdTime / HOLD_REQUIRED) * 100);

  return (
    <div className="forge-game-container fade-in" style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '1rem', color: 'var(--silver)', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Star Energy Remaining
        </div>
        <div style={{ fontSize: '2.5rem', fontFamily: "'Rajdhani', sans-serif", color: 'var(--reality)' }}>
          {Math.max(0, timeLeft).toFixed(1)}s
        </div>
      </div>

      <div className="forge-iris-container" style={{
        position: 'relative',
        width: '100%',
        height: '40px',
        background: 'rgba(0,0,0,0.5)',
        border: '2px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '1rem',
        boxShadow: inForgeZone ? '0 0 20px rgba(255,165,0,0.4)' : 'none',
        transition: 'box-shadow 0.2s'
      }}>
        {/* The Forge Zone Indicator */}
        <div style={{
          position: 'absolute',
          left: '90%',
          width: '10%',
          height: '100%',
          background: 'rgba(255,255,255,0.05)',
          borderLeft: '2px dashed rgba(255,165,0,0.6)',
          zIndex: 1
        }} />
        
        {/* Power Fill */}
        <div style={{
          height: '100%',
          width: `${power}%`,
          background: inForgeZone ? 'linear-gradient(90deg, #ff8c00, #ffeb3b)' : 'linear-gradient(90deg, #6366f1, #a855f7)',
          boxShadow: inForgeZone ? '0 0 15px rgba(255,165,0,0.8)' : 'none',
          transition: 'width 0.05s linear',
          position: 'relative',
          zIndex: 2
        }} />
      </div>

      <div style={{ marginBottom: '2.5rem', height: '60px' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--silver)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
          Forge Integrity
        </div>
        <div style={{
          width: '80%',
          height: '12px',
          margin: '0 auto',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            width: `${holdPercentage}%`,
            height: '100%',
            background: 'var(--success)',
            transition: 'width 0.1s linear'
          }} />
        </div>
        {inForgeZone && (
          <div style={{ color: '#ffeb3b', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600, animation: 'pulse 0.5s infinite alternate' }}>
            HOLD IT OPEN!
          </div>
        )}
      </div>

      <button 
        className="btn btn-primary"
        onPointerDown={handleTap}
        onClick={handleTap}
        style={{
          width: '100%',
          padding: '2rem',
          fontSize: '2.5rem',
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          letterSpacing: '5px',
          textTransform: 'uppercase',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          color: 'var(--white)',
          userSelect: 'none',
          touchAction: 'manipulation' // Prevents mobile double-tap zoom
        }}
      >
        PULL
      </button>

      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--silver)', opacity: 0.6 }}>
        Mash to pull the iris open. Hold above 90% for 5 seconds to forge the weapon!
      </div>
    </div>
  );
}
