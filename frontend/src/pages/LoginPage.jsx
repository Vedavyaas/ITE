import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, decodeToken } from '../api/client';
import ShieldIcon from '../components/ShieldIcon.jsx';

export default function LoginPage() {
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await login(teamName.trim(), password);
      const payload = decodeToken(token);
      const role = payload?.scope;
      if (role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="bg-mist" />

      <div className="login-box fade-in">
        {/* Infinity stones gradient accent */}
        <div className="blood-accent" style={{ borderRadius: '12px 12px 0 0', marginBottom: '-1px' }} />

        <div className="card" style={{ borderRadius: '0 0 12px 12px', padding: '2.5rem 2rem' }}>

          <div className="login-crest">
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '0.5rem',
              animation: 'shieldGlow 3s ease-in-out infinite',
            }}>
              <ShieldIcon size={110} />
            </div>
            <h1 className="login-title">Capture The Gauntlet</h1>
            <p className="login-subtitle">Wield the stones. Prove your worth.</p>
          </div>

          <div className="ornament-divider">◆</div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="teamName">Team Name</label>
              <input
                id="teamName"
                type="text"
                placeholder="Your squad's designation..."
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Access Key</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your cipher..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
            >
              {loading ? 'Assembling...' : '⚡ Assemble'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: '0.82rem',
            color: 'var(--silver)',
            opacity: 0.45,
          }}>
            "Whatever it takes."
          </p>
        </div>
      </div>
    </div>
  );
}
