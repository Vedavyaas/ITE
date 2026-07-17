import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import NickFuryIcon from '../components/NickFuryIcon.jsx';
import HexStoneIcon from '../components/HexStoneIcon.jsx';
import MindStoneRound from './rounds/MindStoneRound.jsx';
import SpaceStoneRound from './rounds/SpaceStoneRound.jsx';
import RealityStoneRound from './rounds/RealityStoneRound.jsx';
import PowerStoneRound from './rounds/PowerStoneRound.jsx';
import TimeStoneRound from './rounds/TimeStoneRound.jsx';

import { decodeToken, getAckRound, startMission, getRoundStatus, getMissionStarted, logout } from '../api/client';
import { ROUNDS, NICK_FURY_INTRO } from '../config/rounds';

const ROUND_ORDER = ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH'];

export default function UserDashboard() {
  const token = localStorage.getItem('ite_token');
  const payload = token ? decodeToken(token) : null;
  const teamName = payload?.sub ?? 'Agent';

  const introStorageKey = `ite_intro_seen_${teamName}`;

  // State
  const [showIntro, setShowIntro] = useState(() => {
    return localStorage.getItem(introStorageKey) !== 'true';
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const activeRoundId = searchParams.get('round');
  const activeRound = activeRoundId ? ROUNDS.find(r => r.id === activeRoundId) : null;
  const [loadingStone, setLoadingStone] = useState(null);
  const [completedRoundIndex, setCompletedRoundIndex] = useState(-1);
  const [snapState, setSnapState] = useState('idle'); // 'idle', 'snapping'
  const [roundStatus, setRoundStatus] = useState('');
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProgress = async () => {
    try {
      const [status, hasStarted] = await Promise.all([
        getRoundStatus(),
        getMissionStarted()
      ]);
      
      setRoundStatus(status);

      if (!hasStarted) {
        setShowIntro(true);
      } else {
        setShowIntro(false);
      }
      
      const idx = ROUND_ORDER.indexOf(status);
      setCompletedRoundIndex(idx);
    } catch (e) {
      console.error('Failed to fetch round progression', e);
    }
  };

  useEffect(() => {
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle completing the intro
  const handleStartMission = async () => {
    try {
      await startMission();
    } catch (e) {
      console.error('Failed to mark start time', e);
    }
    localStorage.setItem(introStorageKey, 'true');
    setShowIntro(false);
  };

  // Handle attempting to enter a round
  const handleStoneClick = async (round) => {
    setErrorMsg('');
    setLoadingStone(round.id);
    try {
      const isAllowed = await getAckRound(round.id);
      if (isAllowed) {
        setSearchParams({ round: round.id });
      } else {
        setErrorMsg('Access Denied. Complete your current mission first, Agent.');
      }
    } catch (err) {
      setErrorMsg('Failed to verify clearance. Try again.');
    } finally {
      setLoadingStone(null);
    }
  };

  const handleSnap = () => {
    setSnapState('snapping');

    // Add a flash effect
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.inset = '0';
    flash.style.backgroundColor = 'white';
    flash.style.zIndex = '9999';
    flash.style.opacity = '1';
    flash.style.transition = 'opacity 4s ease-out';
    flash.style.pointerEvents = 'none';
    document.body.appendChild(flash);
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flash.style.opacity = '0';
      });
    });

    setTimeout(() => {
      document.body.removeChild(flash);
      // Auto logout after 4 seconds
      logout();
      navigate('/login');
    }, 4000);
  };

  // Render Intro View
  if (showIntro) {
    return (
      <div className="page-wrapper">
        <div className="bg-mist" />
        <Navbar role="ROLE_USER" teamName={teamName} />
        <div className="user-welcome">
          <div className="card fade-in" style={{ padding: '3rem 2.5rem', maxWidth: '600px', margin: '0 auto', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
            {/* Subtle background icon */}
            <div style={{ position: 'absolute', top: '-10px', right: '-20px', opacity: 0.05, transform: 'rotate(15deg)' }}>
              <NickFuryIcon size={250} color="#ffffff" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <NickFuryIcon size={48} color="#c8a030" />
              <h1 style={{ fontSize: '2rem', color: 'var(--white)', margin: 0 }}>
                Transmission Incoming...
              </h1>
            </div>
            
            <div className="fury-briefing" style={{ position: 'relative', zIndex: 1 }}>
              {NICK_FURY_INTRO.lines.map((line, idx) => (
                <p key={idx} style={{ marginBottom: '1rem', color: 'var(--silver)', lineHeight: '1.6' }}>
                  {line}
                </p>
              ))}
              <p style={{ marginTop: '2rem', fontStyle: 'italic', color: 'var(--white)', fontWeight: 500 }}>
                {NICK_FURY_INTRO.quote}
              </p>
            </div>
            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
              <button className="btn btn-primary" onClick={handleStartMission} style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
                {NICK_FURY_INTRO.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Active Round View (Sub-round placeholder)
  if (activeRound) {
    return (
      <div className="page-wrapper">
        <div className="bg-mist" />
        <Navbar role="ROLE_USER" teamName={teamName} />
        
        <div className="user-welcome fade-in">
          <div className="card" style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
            {/* Thematic top border glow */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: activeRound.color, boxShadow: `0 0 15px ${activeRound.glow}` }} />
            
            <button 
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  setSearchParams({});
                }
                fetchProgress();
              }}
              className="btn"
              style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', color: 'var(--silver)' }}
            >
              ← Back to Roadmap
            </button>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <HexStoneIcon size={80} color={activeRound.color} glow={activeRound.glow} />
              </div>
              <h1 style={{ fontSize: '2.5rem', color: 'var(--white)', marginTop: '1rem', textShadow: `0 0 20px ${activeRound.glow}` }}>
                {activeRound.title}
              </h1>
              
              <div className="ornament-divider" style={{ margin: '1.5rem auto' }}>◆</div>
              
              <div style={{ textAlign: 'left', padding: '0 2rem' }}>
                <p style={{ color: 'var(--silver)', lineHeight: '1.7', fontSize: '1.1rem' }}>
                  {activeRound.brief}
                </p>
                {activeRound.hint && (
                  <p style={{ marginTop: '1.5rem', fontStyle: 'italic', color: 'var(--white)', opacity: 0.7 }}>
                    Hint: {activeRound.hint}
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginTop: '3rem' }}>
              {activeRound.id === 'FIRST' ? (
                <MindStoneRound 
                  stoneColor={activeRound.color} 
                  stoneGlow={activeRound.glow} 
                  onComplete={() => { navigate(-1); fetchProgress(); }} 
                />
              ) : activeRound.id === 'SECOND' ? (
                <SpaceStoneRound 
                  stoneColor={activeRound.color} 
                  stoneGlow={activeRound.glow} 
                  onComplete={() => { navigate(-1); fetchProgress(); }} 
                />
              ) : activeRound.id === 'THIRD' ? (
                <RealityStoneRound 
                  stoneColor={activeRound.color} 
                  stoneGlow={activeRound.glow} 
                  onComplete={() => { navigate(-1); fetchProgress(); }} 
                />
              ) : activeRound.id === 'FOURTH' ? (
                <PowerStoneRound 
                  stoneColor={activeRound.color} 
                  stoneGlow={activeRound.glow} 
                  onComplete={() => { navigate(-1); fetchProgress(); }} 
                />
              ) : activeRound.id === 'FIFTH' ? (
                <TimeStoneRound 
                  stoneColor={activeRound.color} 
                  stoneGlow={activeRound.glow} 
                  onComplete={() => { navigate(-1); fetchProgress(); }} 
                />

              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ color: 'var(--silver)', fontStyle: 'italic' }}>
                    Render Sub-round content here for {activeRound.id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Roadmap View
  return (
    <div className="page-wrapper">
      <div className="bg-mist" />
      <Navbar role="ROLE_USER" teamName={teamName} />

      <div className="user-welcome fade-in">


        {errorMsg && (
          <div className="alert alert-error fade-in" style={{ maxWidth: '500px', margin: '0 auto 2rem auto' }}>
            {errorMsg}
          </div>
        )}

        <div className="roadmap-container">
          {ROUNDS.map((round, index) => {
            const isLoading = loadingStone === round.id;
            const isCompleted = index <= completedRoundIndex;
            const isActive = index === completedRoundIndex + 1;
            return (
              <div key={round.id} className={`roadmap-node-wrapper ${isCompleted ? 'completed-segment' : ''}`}>
                {isActive && (
                  <div className="active-pointer">
                    <div className="pointer-text">Next Target</div>
                    <div className="pointer-arrow">▼</div>
                  </div>
                )}
                <button
                  className={`roadmap-node ${isLoading ? 'loading' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => handleStoneClick(round)}
                  disabled={!!loadingStone}
                  style={{
                    '--stone-color': round.color,
                    '--stone-glow': round.glow,
                  }}
                >
                  <div className="roadmap-hex-wrapper">
                    <HexStoneIcon size={44} color={round.color} glow={round.glow} />
                  </div>
                  <div className="roadmap-node-content">
                    <h3>Round {index + 1}</h3>
                    <span>{round.stone}</span>
                  </div>
                </button>
              </div>
            );
          })}
          
          {/* Final Snap Sequence at the end of the roadmap */}
          {roundStatus === 'FIFTH' && (
            <div className="roadmap-node-wrapper fade-in" style={{ marginTop: '3rem' }}>
              <button
                className={`roadmap-node completed`}
                onClick={snapState === 'idle' ? handleSnap : undefined}
                disabled={snapState !== 'idle'}
                style={{
                  background: 'linear-gradient(45deg, var(--power), var(--space))',
                  border: 'none',
                  padding: '1.5rem',
                  width: '100%',
                  maxWidth: '400px',
                  boxShadow: '0 0 25px rgba(255,255,255,0.3)',
                  cursor: snapState === 'idle' ? 'pointer' : 'default',
                  animation: snapState === 'idle' ? 'pulse-success 2s infinite' : 'none'
                }}
              >
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <h3 style={{ fontSize: '1.8rem', color: 'white', letterSpacing: '4px', margin: 0, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>
                    {snapState === 'idle' ? 'YOU WILL GET A CALL IF SHORTLISTED' : 'WAIT FOR RESULT... LOGGING OUT'}
                  </h3>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
