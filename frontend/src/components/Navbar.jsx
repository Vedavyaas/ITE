import { logout } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ role, teamName }) {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar fade-in">
      <div className="navbar-brand">
        <span style={{ fontSize: '1.3rem', filter: 'drop-shadow(0 0 10px rgba(139,0,0,0.8))' }}>🩸</span>
        <span className="navbar-title">[name] · {role === 'ROLE_ADMIN' ? 'Sanctum' : 'Portal'}</span>
        <span className={`navbar-role-badge ${role === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-user'}`}>
          {role === 'ROLE_ADMIN' ? 'Admin' : 'Team'}
        </span>
        {teamName && (
          <span style={{
            fontFamily: "'EB Garamond', serif",
            fontStyle: 'italic',
            fontSize: '0.9rem',
            color: 'var(--aged)',
            opacity: 0.7,
            marginLeft: '0.3rem',
          }}>
            — {teamName}
          </span>
        )}
      </div>

      <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
        ⚔ Depart
      </button>
    </nav>
  );
}
