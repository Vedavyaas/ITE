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
        <span className="navbar-title">Capture The Gauntlet · {role === 'ROLE_ADMIN' ? 'Command' : 'Portal'}</span>
        <span className={`navbar-role-badge ${role === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-user'}`}>
          {role === 'ROLE_ADMIN' ? 'Admin' : 'Team'}
        </span>
        {teamName && (
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: '0.88rem',
            color: 'var(--silver)',
            opacity: 0.6,
            marginLeft: '0.3rem',
          }}>
            — {teamName}
          </span>
        )}
      </div>

      {role === 'ROLE_ADMIN' && (
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          ↩ Exit
        </button>
      )}
    </nav>
  );
}
