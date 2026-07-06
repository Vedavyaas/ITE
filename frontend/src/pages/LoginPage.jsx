import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, decodeToken } from '../api/client';

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
        {/* Blood accent line at top */}
        <div className="blood-accent" style={{ borderRadius: '12px 12px 0 0', marginBottom: '-1px' }} />

        <div className="card" style={{ borderRadius: '0 0 12px 12px', padding: '2.5rem 2rem' }}>

          <div className="login-crest">
            <span className="crest-icon">🦇</span>
            <h1 className="login-title">[name]</h1>
            <p className="login-subtitle">Enter if you dare, child of the night</p>
          </div>

          <div className="ornament-divider">✦</div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="teamName">Team Name</label>
              <input
                id="teamName"
                type="text"
                placeholder="Your covenant's name..."
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Blood Oath (Password)</label>
              <input
                id="password"
                type="password"
                placeholder="Whisper the incantation..."
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
              {loading ? 'Awakening...' : '⚔ Enter the Sanctum'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontFamily: "'EB Garamond', serif",
            fontStyle: 'italic',
            fontSize: '0.85rem',
            color: 'var(--aged)',
            opacity: 0.5,
          }}>
            "Every creature of darkness fears the light — but not us."
          </p>
        </div>
      </div>
    </div>
  );
}
