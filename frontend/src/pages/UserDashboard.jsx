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

import { decodeToken, getAckRound, startMission, getRoundStatus, getMissionStarted, getTeamMembers, logout } from '../api/client';
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
  const [showDebrief, setShowDebrief] = useState(false);
  const [debriefTimer, setDebriefTimer] = useState(30);
  const [teamMembers, setTeamMembers] = useState([]);
  const [roundStatus, setRoundStatus] = useState('');
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProgress = async () => {
    try {
      const [status, hasStarted, members] = await Promise.all([
        getRoundStatus(),
        getMissionStarted(),
        getTeamMembers().catch(() => [])
      ]);
      
      setRoundStatus(status);
      if (Array.isArray(members)) {
        setTeamMembers(members);
      }

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

  // 10-Second Auto-Exit Timer for Debrief View
  useEffect(() => {
    if (!showDebrief) return;
    const interval = setInterval(() => {
      setDebriefTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          logout();
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showDebrief, navigate]);

  const handleExitNow = () => {
    logout();
    navigate('/login');
  };

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

  // Render Mission Debriefing & Final Stats View
  if (showDebrief) {
    return (
      <div className="page-wrapper">
        <div className="bg-mist" />
        <Navbar role="ROLE_USER" teamName={teamName} />

        <div className="user-welcome fade-in" style={{ maxWidth: '840px', margin: '0 auto', padding: '1rem' }}>
          <div className="debrief-card fade-in" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', position: 'relative' }}>
            {/* Top decorative gradient bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #ffd700, #38bdf8, #ef4444, #a855f7, #22c55e)',
            }} />

            {/* Countdown HUD & Warning Banner */}
            <div className={`debrief-timer-hud ${debriefTimer <= 5 ? 'timer-warning' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '2px solid #ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  fontFamily: "'Rajdhani', sans-serif",
                  color: '#f87171',
                  boxShadow: '0 0 16px rgba(239, 68, 68, 0.45)',
                  flexShrink: 0,
                }}>
                  {debriefTimer}
                </div>
                <div>
                  <div style={{
                    fontSize: '0.82rem',
                    letterSpacing: '2px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#f87171',
                    fontFamily: "'Rajdhani', sans-serif",
                  }}>
                    Session Terminating in {debriefTimer}s
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--silver)', marginTop: '2px' }}>
                    Telemetry locked. System will auto-exit when countdown reaches zero.
                  </div>
                </div>
              </div>

              <button
                className="btn btn-danger btn-sm"
                onClick={handleExitNow}
                style={{
                  letterSpacing: '1px',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.55rem 1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                }}
              >
                <span>Exit Console Now</span> →
              </button>
            </div>

            {/* S.H.I.E.L.D. Emblem & Title */}
            <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <NickFuryIcon size={40} color="#c8a030" />
                <span style={{
                  background: 'rgba(200, 160, 48, 0.15)',
                  border: '1px solid rgba(200, 160, 48, 0.4)',
                  color: '#fbbf24',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  letterSpacing: '2px',
                  fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif",
                  textTransform: 'uppercase',
                }}>
                  Official Debriefing • S.H.I.E.L.D. Protocol
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(1.75rem, 5vw, 2.4rem)',
                color: '#fff',
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: '3px',
                margin: '0.4rem 0',
                textTransform: 'uppercase',
              }}>
                Mission Accomplished
              </h1>
              <p style={{
                color: 'var(--silver)',
                maxWidth: '600px',
                margin: '0 auto',
                fontSize: '0.92rem',
                lineHeight: '1.6',
              }}>
                All chronological and spatial anomalies have been neutralized. The five Infinity Singularities are locked in S.H.I.E.L.D. custody.
              </p>
            </div>

            {/* Squad Stats Profile Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}>
              {/* Squad Name Card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1.25rem',
              }}>
                <div style={{
                  fontSize: '0.72rem',
                  letterSpacing: '2px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif",
                  marginBottom: '0.4rem',
                }}>
                  Squad Designation
                </div>
                <div style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#fff',
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: '1px',
                }}>
                  {teamName}
                </div>
                <div style={{
                  marginTop: '0.6rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  color: '#4ade80',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: '1px',
                }}>
                  <span>●</span> 100% COMPLETE • ALL OBJECTIVES MET
                </div>
              </div>

              {/* Squad Operatives Card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1.25rem',
              }}>
                <div style={{
                  fontSize: '0.72rem',
                  letterSpacing: '2px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif",
                  marginBottom: '0.6rem',
                }}>
                  Squad Operatives ({teamMembers.length || 1})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {teamMembers.length > 0 ? (
                    teamMembers.map((member, i) => (
                      <span key={i} style={{
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        color: '#bae6fd',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                      }}>
                        👤 {member}
                      </span>
                    ))
                  ) : (
                    <span style={{
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      color: '#bae6fd',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                    }}>
                      👤 {teamName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 5 Infinity Stones Secured Grid */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '1.35rem',
              marginBottom: '1.75rem',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                marginBottom: '1rem',
                gap: '0.5rem',
              }}>
                <div style={{
                  fontSize: '0.82rem',
                  letterSpacing: '2px',
                  color: '#fff',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif",
                }}>
                  Secured Singularities (5 / 5)
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  letterSpacing: '1px',
                  color: '#4ade80',
                  fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif",
                  textTransform: 'uppercase',
                }}>
                  Quantum Containment Active ✓
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
                gap: '0.75rem',
              }}>
                {ROUNDS.map((r, i) => (
                  <div key={r.id} className="debrief-stone-card" style={{
                    border: `1px solid ${r.color}40`,
                    boxShadow: `0 0 15px ${r.glow}20`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>
                      <HexStoneIcon size={30} color={r.color} glow={r.glow} />
                    </div>
                    <div style={{
                      fontSize: '0.72rem',
                      color: '#fff',
                      fontWeight: 700,
                      fontFamily: "'Rajdhani', sans-serif",
                      letterSpacing: '1px',
                    }}>
                      Round {i + 1}
                    </div>
                    <div style={{
                      fontSize: '0.78rem',
                      color: r.color,
                      fontWeight: 600,
                      marginTop: '2px',
                    }}>
                      {r.stone}
                    </div>
                    <div style={{
                      fontSize: '0.65rem',
                      color: '#4ade80',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      marginTop: '4px',
                    }}>
                      SECURED ✓
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Director Nick Fury Encrypted Transmission */}
            <div style={{
              padding: '1.25rem',
              borderRadius: '10px',
              background: 'rgba(200, 160, 48, 0.05)',
              borderLeft: '3px solid #c8a030',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                color: 'var(--silver)',
                fontStyle: 'italic',
                fontSize: '0.88rem',
                lineHeight: '1.6',
                margin: 0,
              }}>
                "Your performance has been logged into the global telemetry registry. If shortlisted, your team will be notified for the next deployment phase. Good hunting, Agents."
              </p>
              <div style={{
                fontSize: '0.75rem',
                color: '#c8a030',
                letterSpacing: '1px',
                fontWeight: 700,
                fontFamily: "'Rajdhani', sans-serif",
                marginTop: '0.5rem',
                textTransform: 'uppercase',
              }}>
                — Director Nick Fury • S.H.I.E.L.D. Command
              </div>
            </div>

            {/* Countdown Progress Bar */}
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${(debriefTimer / 30) * 100}%`,
                background: debriefTimer <= 5
                  ? '#ef4444'
                  : 'linear-gradient(90deg, #ef4444, #f59e0b, #22c55e)',
                transition: 'width 1s linear',
              }} />
            </div>
            <div style={{
              textAlign: 'center',
              marginTop: '0.6rem',
              fontSize: '0.75rem',
              color: '#94a3b8',
              letterSpacing: '1px',
              fontFamily: "'Rajdhani', sans-serif",
            }}>
              AUTO-EXITING CONSOLE IN {debriefTimer} SECONDS
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
              style={{ position: 'absolute', top: 'clamp(0.75rem, 2.5vw, 1.5rem)', left: 'clamp(0.75rem, 2.5vw, 1.5rem)', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', color: 'var(--silver)' }}
            >
              ← Back to Roadmap
            </button>

            <div style={{ textAlign: 'center', marginTop: 'clamp(2rem, 5vw, 3rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <HexStoneIcon size={80} color={activeRound.color} glow={activeRound.glow} />
              </div>
              <h1 style={{ fontSize: 'clamp(1.6rem, 5.5vw, 2.5rem)', color: 'var(--white)', marginTop: '1rem', textShadow: `0 0 20px ${activeRound.glow}` }}>
                {activeRound.title}
              </h1>
              
              <div className="ornament-divider" style={{ margin: '1.5rem auto' }}>◆</div>
              
              <div style={{ textAlign: 'left', padding: '0 clamp(0.5rem, 3vw, 2rem)' }}>
                <p style={{ color: 'var(--silver)', lineHeight: '1.7', fontSize: 'clamp(0.9rem, 2.8vw, 1.05rem)' }}>
                  {activeRound.brief}
                </p>
                {activeRound.hint && (
                  <p style={{ marginTop: '1.5rem', fontStyle: 'italic', color: 'var(--white)', opacity: 0.7 }}>
                    Hint: {activeRound.hint}
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginTop: 'clamp(1.5rem, 4vw, 3rem)' }}>
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
          
          {/* Mission Complete & Debrief Navigation */}
          {roundStatus === 'FIFTH' && (
            <div className="roadmap-node-wrapper fade-in" style={{ marginTop: '3rem' }}>
              <button
                className="roadmap-node completed"
                onClick={() => {
                  setDebriefTimer(30);
                  setShowDebrief(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(56,189,248,0.2) 50%, rgba(168,85,247,0.2) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                  padding: '1.25rem 2rem',
                  width: '100%',
                  maxWidth: '480px',
                  boxShadow: '0 0 30px rgba(56, 189, 248, 0.25)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  animation: 'pulse-success 2s infinite',
                }}
              >
                <span style={{ fontSize: '1.75rem' }}>🏆</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontSize: '1.15rem',
                    color: '#fff',
                    fontWeight: 700,
                    fontFamily: "'Rajdhani', sans-serif",
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                  }}>
                    Mission Debriefing & Statistics
                  </div>
                  <div style={{
                    fontSize: '0.78rem',
                    color: '#94a3b8',
                    letterSpacing: '1px',
                    marginTop: '3px',
                  }}>
                    All 5 Stones Secured • View Telemetry & Final Stats →
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
