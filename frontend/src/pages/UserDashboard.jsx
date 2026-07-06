import Navbar from '../components/Navbar.jsx';
import { decodeToken } from '../api/client';

export default function UserDashboard() {
  const token    = localStorage.getItem('ite_token');
  const payload  = token ? decodeToken(token) : null;
  const teamName = payload?.sub ?? 'Traveller';

  return (
    <div className="page-wrapper">
      <div className="bg-mist" />
      <Navbar role="ROLE_USER" teamName={teamName} />

      <div className="user-welcome">
        <div className="card user-welcome-card fade-in">
          <span className="user-welcome-icon">🌑</span>

          <h1 className="user-welcome-title">
            Welcome,<br />
            <span style={{ color: 'var(--rose)', textShadow: '0 0 20px rgba(139,0,0,0.5)' }}>
              {teamName}
            </span>
          </h1>

          <div className="ornament-divider" style={{ margin: '1.2rem auto', maxWidth: '200px' }}>
            ✦
          </div>

          <p className="user-welcome-message">
            The night is long and the trials await.<br />
            Your journey through the dark has begun.<br />
            Stand by — the challenge approaches.
          </p>

          <p style={{
            marginTop: '2rem',
            fontFamily: "'Cinzel', serif",
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--crimson)',
            opacity: 0.5,
          }}>
            ✦ ✦ ✦
          </p>
        </div>
      </div>
    </div>
  );
}
