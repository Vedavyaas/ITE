import { useState, useEffect } from 'react';
import HexStoneIcon from '../../components/HexStoneIcon.jsx';
import { getTeamMembers, sacrificeTeamMember, updateSubRound, updateRound } from '../../api/client';

export default function SoulStoneRound({ onComplete, stoneColor, stoneGlow }) {
  // phases: 'intro', 'selection', 'confirm', 'sacrificing', 'won'
  const [phase, setPhase] = useState('intro');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchMembers() {
      try {
        const teamMembers = await getTeamMembers();
        setMembers(teamMembers);
      } catch (err) {
        console.error("Failed to load members", err);
        setErrorMsg("Could not load team members for the sacrifice.");
      }
    }
    fetchMembers();
  }, []);

  const handleStartSelection = () => {
    setPhase('selection');
  };

  const handleSelect = (member) => {
    setSelectedMember(member);
    setPhase('confirm');
  };

  const handleCancel = () => {
    setSelectedMember(null);
    setPhase('selection');
  };

  const handleSacrifice = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      // Perform the sacrifice
      await sacrificeTeamMember(selectedMember);
      
      // Update progression
      await updateSubRound('COMPLETED');
      await updateRound('COMPLETED');
      
      setPhase('won');
    } catch (err) {
      setErrorMsg(err.message || 'The sacrifice was rejected.');
      setPhase('selection');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRound = () => {
    if (onComplete) onComplete();
  };

  if (phase === 'intro') {
    return (
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', background: 'linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(30,10,10,1) 100%)', border: '1px solid rgba(255,165,0,0.1)' }}>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '2rem', color: 'var(--soul)', marginBottom: '1.5rem', letterSpacing: '2px' }}>
          Vormir: The Domain of Death
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '1.5rem', lineHeight: '1.8', fontSize: '1.1rem' }}>
          You have reached the final trial. The Soul Stone holds a special place among the Infinity Stones. It has a certain wisdom. To ensure that whoever possesses it understands its power... the Stone demands a sacrifice.
        </p>
        <p style={{ color: '#fca5a5', marginBottom: '2.5rem', fontStyle: 'italic', fontSize: '1.05rem', textShadow: '0 0 10px rgba(255,0,0,0.2)' }}>
          A soul for a soul. One of your squad members must be left behind. The eliminated member will officially receive no rewards in case of victory. It is a painful choice, but it is the only way.
        </p>
        {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}
        <button className="btn" style={{ background: 'var(--soul)', color: '#fff', border: 'none' }} onClick={handleStartSelection}>
          We Understand
        </button>
      </div>
    );
  }

  if (phase === 'selection') {
    return (
      <div className="card fade-in" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(20,10,10,0.8)' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--white)', marginBottom: '1rem' }}>
          Make Your Choice
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '2rem' }}>
          Select the squad member who will make the ultimate sacrifice.
        </p>
        
        {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
          {members.map(m => (
            <button
              key={m}
              onClick={() => handleSelect(m)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,165,0,0.2)',
                padding: '1rem',
                borderRadius: '8px',
                color: 'var(--white)',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,165,0,0.1)'; e.currentTarget.style.borderColor = 'var(--soul)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,165,0,0.2)'; }}
            >
              {m}
            </button>
          ))}
          {members.length === 0 && (
            <p style={{ color: 'var(--silver)', fontStyle: 'italic' }}>Loading squad members...</p>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'confirm') {
    return (
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', border: '1px solid #ef4444', background: 'rgba(20,5,5,0.9)' }}>
        <h2 style={{ fontSize: '2rem', color: '#ef4444', marginBottom: '1rem' }}>
          Are you absolutely certain?
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          You are about to sacrifice <strong style={{ color: 'var(--white)' }}>{selectedMember}</strong>.
        </p>
        <p style={{ color: '#fca5a5', marginBottom: '2.5rem', fontStyle: 'italic' }}>
          This action cannot be undone. {selectedMember} will be eliminated and will not share in the glory or the rewards of this victory. They will be left behind in the dark.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="btn" 
            style={{ borderColor: 'var(--silver)', color: 'var(--silver)', background: 'transparent' }} 
            onClick={handleCancel}
            disabled={loading}
          >
            Turn Back
          </button>
          <button 
            className="btn" 
            style={{ background: '#ef4444', color: 'var(--white)', borderColor: '#ef4444' }} 
            onClick={handleSacrifice}
            disabled={loading}
          >
            {loading ? 'Sacrificing...' : 'Sacrifice ' + selectedMember}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'won') {
    return (
      <div className="card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <HexStoneIcon size={80} color={stoneColor} glow={stoneGlow} />
        <h2 style={{ fontSize: '1.8rem', color: stoneColor, marginTop: '1.5rem', marginBottom: '1rem' }}>
          Soul Stone Secured
        </h2>
        <p style={{ color: 'var(--silver)', marginBottom: '2rem', lineHeight: '1.6', fontStyle: 'italic' }}>
          The deed is done. The heavy price has been paid, and the final stone is yours. Let us hope their sacrifice was not in vain.
        </p>
        <button 
          className="btn btn-primary"
          onClick={handleCompleteRound}
          style={{ background: 'var(--soul)', borderColor: 'var(--soul)' }}
        >
          Acknowledge & Complete
        </button>
      </div>
    );
  }

  return null;
}
