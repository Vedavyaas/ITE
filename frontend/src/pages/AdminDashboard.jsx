import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar.jsx';
import Toast from '../components/Toast.jsx';
import { getStatistics, createTeam, deleteTeam, decodeToken } from '../api/client';

const ROUNDS = ['YET_TO_START', 'FIRST', 'SECOND', 'THIRD'];
const SUBROUNDS = ['YET_TO_START', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT'];

function roundLabel(r) {
  const map = { YET_TO_START: 'Yet to Start', FIRST: 'Round 1', SECOND: 'Round 2', THIRD: 'Round 3' };
  return map[r] || r;
}

function roundClass(r) {
  const map = { YET_TO_START: 'yet', FIRST: 'first', SECOND: 'second', THIRD: 'third' };
  return map[r] || 'yet';
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// ── Leaderboard panel ──────────────────────────────────────────────
function LeaderboardPanel() {
  const [stats, setStats]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStatistics();
      setStats(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Summary counts
  const total = stats.length;
  const inProgress = stats.filter(s => s.roundProgression !== 'YET_TO_START').length;
  const finished   = stats.filter(s => s.roundProgression === 'THIRD').length;

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">🏆 Leaderboard</h2>
        <p className="section-subtitle">The order of the damned — ranked by progression</p>
      </div>

      <div className="stat-cards fade-in-delay-1">
        <div className="stat-card">
          <div className="stat-card-value">{total}</div>
          <div className="stat-card-label">Total Teams</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{inProgress}</div>
          <div className="stat-card-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{finished}</div>
          <div className="stat-card-label">Completed</div>
        </div>
      </div>

      <div className="card fade-in-delay-2">
        <div className="refresh-row">
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--aged)', opacity: 0.6 }}>
            Standings
          </span>
          <button className="btn btn-ghost btn-sm" onClick={fetchStats} disabled={loading}>
            {loading ? '...' : '↻ Refresh'}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && stats.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-state-icon">🕸</div>
            <div className="empty-state-text">No souls have entered yet.</div>
          </div>
        )}

        {stats.length > 0 && (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>Round</th>
                <th>Sub-Round</th>
                <th>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => (
                <tr key={s.teamName}>
                  <td className={`rank-cell rank-${i + 1}`}>
                    {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </td>
                  <td style={{ fontFamily: "'Cinzel', serif", fontSize: '0.9rem' }}>{s.teamName}</td>
                  <td>
                    <span className={`round-badge ${roundClass(s.roundProgression)}`}>
                      {roundLabel(s.roundProgression)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--aged)', fontSize: '0.9rem' }}>
                    {s.subRound !== 'YET_TO_START' ? s.subRound : '—'}
                  </td>
                  <td style={{ color: 'var(--aged)', fontSize: '0.88rem' }}>{formatTime(s.timeTaken)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Create Team panel ──────────────────────────────────────────────
function CreateTeamPanel({ onToast }) {
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createTeam(teamName.trim(), password);
      onToast('Team created successfully!', 'success');
      setTeamName('');
      setPassword('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card fade-in">
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1rem', marginBottom: '1.2rem', color: 'var(--rose)' }}>
        ✦ Summon a New Team
      </h3>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleCreate}>
        <div className="input-group">
          <label htmlFor="create-team-name">Team Name</label>
          <input
            id="create-team-name"
            type="text"
            placeholder="Name their covenant..."
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="create-team-password">Password</label>
          <input
            id="create-team-password"
            type="password"
            placeholder="Their blood oath..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          id="btn-create-team"
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Binding...' : '🩸 Create Team'}
        </button>
      </form>
    </div>
  );
}

// ── Delete Team panel ──────────────────────────────────────────────
function DeleteTeamPanel({ onToast, teams }) {
  const [teamId, setTeamId]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [confirm, setConfirm] = useState(false);

  async function handleDelete(e) {
    e.preventDefault();
    if (!confirm) { setConfirm(true); return; }
    setError('');
    setLoading(true);
    try {
      await deleteTeam(teamId.trim());
      onToast('Team banished successfully!', 'success');
      setTeamId('');
      setConfirm(false);
    } catch (e) {
      setError(e.message);
      setConfirm(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card fade-in">
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1rem', marginBottom: '1.2rem', color: 'var(--ember)' }}>
        ⚰ Banish a Team
      </h3>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleDelete}>
        <div className="input-group">
          <label htmlFor="delete-team-id">Select Team</label>
          {teams.length > 0 ? (
            <select id="delete-team-id" value={teamId}
              onChange={e => { setTeamId(e.target.value); setConfirm(false); }} required>
              <option value="">— Choose the condemned —</option>
              {teams.map(t => (
                <option key={t.teamName} value={t.teamName}>{t.teamName}</option>
              ))}
            </select>
          ) : (
            <input id="delete-team-id" type="text" placeholder="Name of the condemned..."
              value={teamId} onChange={e => { setTeamId(e.target.value); setConfirm(false); }} required />
          )}
        </div>

        {confirm && (
          <div className="alert alert-error" style={{ marginBottom: '0.8rem' }}>
            ⚠ Permanently banish <strong>{teamId}</strong>? Click again to confirm.
          </div>
        )}

        <button
          id="btn-delete-team"
          type="submit"
          className={`btn ${confirm ? 'btn-danger' : 'btn-ghost'}`}
          disabled={loading || !teamId}
          style={{ width: '100%' }}
        >
          {loading ? 'Banishing...' : confirm ? '⚰ Confirm Banishment' : '⚔ Banish Team'}
        </button>
      </form>
    </div>
  );
}

// ── Manage Teams panel ─────────────────────────────────────────────
function ManageTeamsPanel({ onToast }) {
  const [teams, setTeams]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStatistics();
      setTeams(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  function handleToast(msg, type) {
    onToast(msg, type);
    fetchTeams();
  }

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">👥 Manage Teams</h2>
        <p className="section-subtitle">Summon or banish covenants from the realm</p>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <CreateTeamPanel onToast={handleToast} />
        <DeleteTeamPanel onToast={handleToast} teams={teams} />
      </div>

      <div className="card fade-in-delay-2">
        <div className="refresh-row">
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--aged)', opacity: 0.6 }}>
            All Covenants ({teams.length})
          </span>
          <button className="btn btn-ghost btn-sm" onClick={fetchTeams} disabled={loading}>
            {loading ? '...' : '↻ Refresh'}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && teams.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-state-icon">🕸</div>
            <div className="empty-state-text">No covenants summoned yet.</div>
          </div>
        )}

        {teams.length > 0 && (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>#</th><th>Team Name</th><th>Round</th><th>Sub-Round</th><th>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t, i) => (
                <tr key={t.teamName}>
                  <td className="rank-cell" style={{ color: 'var(--aged)', opacity: 0.6 }}>{i + 1}</td>
                  <td style={{ fontFamily: "'Cinzel', serif", fontSize: '0.9rem' }}>{t.teamName}</td>
                  <td><span className={`round-badge ${roundClass(t.roundProgression)}`}>{roundLabel(t.roundProgression)}</span></td>
                  <td style={{ color: 'var(--aged)', fontSize: '0.9rem' }}>{t.subRound !== 'YET_TO_START' ? t.subRound : '—'}</td>
                  <td style={{ color: 'var(--aged)', fontSize: '0.88rem' }}>{formatTime(t.timeTaken)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Nav items ─────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'leaderboard', label: 'Leaderboard',  icon: '🏆' },
  { id: 'manage',      label: 'Manage Teams', icon: '👥' },
];

// ── Admin Dashboard (main export) ─────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [toast, setToast]         = useState(null);

  const token   = localStorage.getItem('ite_token');
  const payload = token ? decodeToken(token) : null;
  const teamName = payload?.sub ?? '';

  function showToast(message, type = 'success') {
    setToast({ message, type });
  }

  return (
    <div className="page-wrapper">
      <div className="bg-mist" />
      <Navbar role="ROLE_ADMIN" teamName={teamName} />

      <div className="dashboard-layout">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Navigation</div>
            <ul className="sidebar-nav">
              {NAV_ITEMS.map(item => (
                <li
                  key={item.id}
                  id={`nav-${item.id}`}
                  className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="main-content">
          {activeTab === 'leaderboard' && <LeaderboardPanel />}
          {activeTab === 'manage'      && <ManageTeamsPanel onToast={showToast} />}
        </main>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
