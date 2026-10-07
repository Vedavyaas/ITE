import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar.jsx';
import Toast from '../components/Toast.jsx';
import { getStatistics, createTeam, deleteTeam, decodeToken, forceLogoutTeam, forceLogoutAllTeams } from '../api/client';

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

function formatDuration(ms) {
  if (ms == null || isNaN(ms)) return '—';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatStartTime(st) {
  if (!st) return '—';
  try {
    const d = new Date(st);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '—';
  }
}
// ── Leaderboard panel ──────────────────────────────────────────────
function LeaderboardPanel() {
  const [stats, setStats]       = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStatistics();
      setStats(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const filteredStats = stats.filter(s => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const teamMatches = s.teamName?.toLowerCase().includes(q);
    const memberMatches = Array.isArray(s.teamMembers) && s.teamMembers.some(m => m?.toLowerCase().includes(q));
    const roundMatches = roundLabel(s.roundProgression)?.toLowerCase().includes(q);
    return teamMatches || memberMatches || roundMatches;
  });

  const downloadCSV = () => {
    if (!stats || stats.length === 0) return;
    
    const headers = ["Rank", "Team Name", "Round", "Time Taken"];
    const exportList = search.trim() ? filteredStats : stats;
    const rows = exportList.map((s) => {
      const rank = stats.findIndex(item => item.teamName === s.teamName) + 1;
      const team = s.teamName.replace(/,/g, ''); // basic escaping
      const round = roundLabel(s.roundProgression);
      const time = formatDuration(s.timeTaken);
      return [rank, team, round, time].join(",");
    });
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", search.trim() ? "leaderboard-filtered.csv" : "leaderboard.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Summary counts
  const total = stats.length;
  const inProgress = stats.filter(s => s.roundProgression !== 'YET_TO_START').length;
  const finished   = stats.filter(s => s.roundProgression === 'COMPLETED' && s.subRound === 'COMPLETED').length;

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">🏆 Leaderboard</h2>
        <p className="section-subtitle">Squad rankings — sorted by progression</p>
      </div>

      <div className="stat-cards fade-in fade-in-delay-1">
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

      <div className="card fade-in fade-in-delay-2">
        <div className="refresh-row" style={{ flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div className="admin-search-wrapper">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search squad, member, or round..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {search && (
              <span className="admin-search-meta">
                Showing {filteredStats.length} of {stats.length}
              </span>
            )}
            <button className="btn btn-ghost btn-sm" onClick={downloadCSV} disabled={loading || stats.length === 0}>
              ⬇ Download CSV
            </button>
            <button className="btn btn-ghost btn-sm" onClick={fetchStats} disabled={loading}>
              {loading ? '...' : '↻ Refresh'}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && stats.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-state-icon">💎</div>
            <div className="empty-state-text">No squads on the board yet.</div>
          </div>
        )}

        {!loading && stats.length > 0 && filteredStats.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-text">No squads match "{search}"</div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setSearch('')}
            >
              Clear Search
            </button>
          </div>
        )}

        {filteredStats.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team & Members</th>
                  <th>Round</th>
                  <th>Time Taken</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.map((s) => {
                  const originalRank = stats.findIndex(item => item.teamName === s.teamName) + 1;
                  const membersList = Array.isArray(s.teamMembers) ? s.teamMembers : [];
                  return (
                    <tr key={s.teamName}>
                      <td className={`rank-cell rank-${originalRank}`}>
                        {originalRank === 1 ? '👑' : originalRank === 2 ? '🥈' : originalRank === 3 ? '🥉' : `#${originalRank}`}
                      </td>
                      <td>
                        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: '0.95rem' }}>
                          {s.teamName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--silver)', opacity: 0.8, marginTop: '0.2rem' }}>
                          {membersList.length > 0 ? membersList.map((m, idx) => (
                            <span key={idx} style={{ marginRight: '0.4rem' }}>
                              {m}
                            </span>
                          )) : 'No members'}
                        </div>
                      </td>
                      <td>
                        <span className={`round-badge ${roundClass(s.roundProgression)}`}>
                          {roundLabel(s.roundProgression)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--silver)', fontSize: '0.88rem', fontFamily: 'monospace' }}>
                        {formatDuration(s.timeTaken)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Create Team panel ──────────────────────────────────────────────
function CreateTeamPanel({ onToast }) {
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('123');
  const [members, setMembers]   = useState(['']);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function setMember(index, value) {
    setMembers(prev => prev.map((m, i) => (i === index ? value : m)));
  }

  function addMember() {
    setMembers(prev => [...prev, '']);
  }

  function removeMember(index) {
    if (members.length > 1) {
      setMembers(prev => prev.filter((_, i) => i !== index));
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');

    // Client-side duplicate and empty checks
    const trimmed = members.map(m => m.trim());
    if (trimmed.length < 1 || trimmed.some(m => !m)) {
      setError('Please fill in all member names or remove empty fields.');
      return;
    }

    const unique = new Set(trimmed);
    if (unique.size !== trimmed.length) {
      setError('Team member names must be unique — duplicate names found.');
      return;
    }

    setLoading(true);
    try {
      await createTeam(teamName.trim(), password, trimmed);
      onToast('Team created successfully!', 'success');
      setTeamName('');
      setPassword('123');
      setMembers(['']);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card fade-in">
      <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', color: 'var(--power)' }}>
        ◆ Register a Squad
      </h3>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleCreate}>
        <div className="input-group">
          <label htmlFor="create-team-name">Team Name</label>
          <input
            id="create-team-name"
            type="text"
            placeholder="Squad designation..."
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="create-team-password">Password (Default: 123)</label>
          <div style={{ position: 'relative' }}>
            <input
              id="create-team-password"
              type={showPassword ? "text" : "password"}
              placeholder="Access key (default: 123)..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ paddingRight: '2.5rem', width: '100%', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--silver)',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.2rem'
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <label style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--silver)', opacity: 0.7 }}>
              Team Members ({members.length})
            </label>
            <button
              type="button"
              id="btn-add-member"
              onClick={addMember}
              className="btn btn-ghost btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.65rem',
                fontSize: '0.75rem',
                minHeight: '30px',
                color: 'var(--arc-blue, #60C8F8)',
                borderColor: 'rgba(96, 200, 248, 0.3)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>+</span> Add Member
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {members.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                  <input
                    id={`create-member-${i + 1}`}
                    type="text"
                    placeholder={`Member ${i + 1} name...`}
                    value={m}
                    onChange={e => setMember(i, e.target.value)}
                    required
                  />
                </div>
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMember(i)}
                    className="btn btn-ghost"
                    title={`Remove Member ${i + 1}`}
                    aria-label={`Remove Member ${i + 1}`}
                    style={{
                      padding: '0',
                      width: '42px',
                      height: '42px',
                      minHeight: '42px',
                      color: '#ef4444',
                      borderColor: 'rgba(239,68,68,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          id="btn-create-team"
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: '0.4rem' }}
        >
          {loading ? 'Creating...' : '⚡ Create Squad'}
        </button>
      </form>
    </div>
  );
}

// ── Delete Team panel ──────────────────────────────────────────────
function DeleteTeamPanel({ onToast, teams }) {
  const [teamId, setTeamId]         = useState('');
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [confirm, setConfirm]       = useState(false);

  const filteredTeams = teams.filter(t => {
    if (!filterText.trim()) return true;
    const q = filterText.trim().toLowerCase();
    const nameMatches = t.teamName?.toLowerCase().includes(q);
    const memberMatches = Array.isArray(t.teamMembers) && t.teamMembers.some(m => m?.toLowerCase().includes(q));
    return nameMatches || memberMatches;
  });

  async function handleDelete(e) {
    e.preventDefault();
    if (!confirm) { setConfirm(true); return; }
    setError('');
    setLoading(true);
    try {
      await deleteTeam(teamId.trim());
      onToast('Team banished successfully!', 'success');
      setTeamId('');
      setFilterText('');
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
      <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', color: 'var(--reality)' }}>
        ✕ Remove a Squad
      </h3>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleDelete}>
        <div className="input-group">
          <label htmlFor="delete-team-id">Select Squad</label>

          {teams.length > 0 && (
            <div className="admin-search-wrapper" style={{ maxWidth: '100%', marginBottom: '0.55rem' }}>
              <span className="admin-search-icon">🔍</span>
              <input
                id="search-delete-squad"
                type="text"
                className="admin-search-input"
                placeholder="Search squad or member to remove..."
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
              />
              {filterText && (
                <button
                  type="button"
                  className="admin-search-clear"
                  onClick={() => setFilterText('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {teams.length > 0 ? (
            filteredTeams.length > 0 ? (
              <select
                id="delete-team-id"
                value={teamId}
                onChange={e => { setTeamId(e.target.value); setConfirm(false); }}
                required
              >
                <option value="">— Select squad {filterText ? `(${filteredTeams.length} matches)` : ''} —</option>
                {filteredTeams.map(t => (
                  <option key={t.teamName} value={t.teamName}>
                    {t.teamName} {Array.isArray(t.teamMembers) && t.teamMembers.length > 0 ? `(${t.teamMembers.join(', ')})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ fontSize: '0.8rem', color: '#ff7070', padding: '0.4rem 0' }}>
                No squads match "{filterText}". <button type="button" onClick={() => setFilterText('')} style={{ background: 'none', border: 'none', color: '#60C8F8', cursor: 'pointer', textDecoration: 'underline' }}>Show all</button>
              </div>
            )
          ) : (
            <input
              id="delete-team-id"
              type="text"
              placeholder="Squad name..."
              value={teamId}
              onChange={e => { setTeamId(e.target.value); setConfirm(false); }}
              required
            />
          )}
        </div>

        {confirm && (
          <div className="alert alert-error" style={{ marginBottom: '0.8rem' }}>
            ⚠ Permanently delete <strong>{teamId}</strong>? Click again to confirm.
          </div>
        )}

        <button
          id="btn-delete-team"
          type="submit"
          className={`btn ${confirm ? 'btn-danger' : 'btn-ghost'}`}
          disabled={loading || !teamId}
          style={{ width: '100%' }}
        >
          {loading ? 'Removing...' : confirm ? '✕ Confirm Removal' : '✕ Remove Squad'}
        </button>
      </form>
    </div>
  );
}

// ── Manage Teams table ────────────────────────────────────────────
function ManageTeamsTable({ teams, allTeams, onToast }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleForceLogout = async (teamName) => {
    try {
      setLoadingId(teamName);
      await forceLogoutTeam(teamName);
      if (onToast) onToast(`Force logged out team: ${teamName}`, 'success');
    } catch (err) {
      if (onToast) onToast(`Failed to logout ${teamName}: ${err.message}`, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <table className="leaderboard-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Team</th>
          <th>Start Time</th>
          <th>Round</th>
          <th>Sub-Round</th>
          <th>Members</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((t, i) => {
          const originalIndex = allTeams ? allTeams.findIndex(item => item.teamName === t.teamName) + 1 : i + 1;
          return (
            <tr key={t.teamName}>
              <td className="rank-cell" style={{ color: 'var(--silver)' }}>#{originalIndex}</td>
              <td style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: '0.92rem' }}>
                {t.teamName}
              </td>
              <td style={{ color: 'var(--silver)', fontSize: '0.88rem', fontFamily: 'monospace' }}>
                <span title={t.startTime ? new Date(t.startTime).toLocaleString() : ''}>
                  {formatStartTime(t.startTime)}
                </span>
              </td>
              <td>
                <span className={`round-badge ${roundClass(t.roundProgression)}`}>
                  {roundLabel(t.roundProgression)}
                </span>
              </td>
              <td style={{ color: 'var(--silver)', fontSize: '0.9rem' }}>
                {t.subRound !== 'YET_TO_START' ? t.subRound : '—'}
              </td>
              <td style={{ color: 'var(--silver)', fontSize: '0.85rem' }}>
                {Array.isArray(t.teamMembers) ? t.teamMembers.join(', ') : '—'}
              </td>
              <td>
                <button 
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                  onClick={() => handleForceLogout(t.teamName)}
                  disabled={loadingId === t.teamName}
                >
                  {loadingId === t.teamName ? '...' : 'Allow Login Again'}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Manage Teams panel ─────────────────────────────────────────────
function ManageTeamsPanel({ onToast }) {
  const [teams, setTeams]       = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const [unlockingAll, setUnlockingAll] = useState(false);
  const [confirmUnlockAll, setConfirmUnlockAll] = useState(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStatistics();
      setTeams(Array.isArray(data) ? data : []);
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

  const filteredTeams = teams.filter(t => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const nameMatches = t.teamName?.toLowerCase().includes(q);
    const memberMatches = Array.isArray(t.teamMembers) && t.teamMembers.some(m => m?.toLowerCase().includes(q));
    const roundMatches = roundLabel(t.roundProgression)?.toLowerCase().includes(q);
    const subMatches = t.subRound?.toLowerCase().includes(q);
    return nameMatches || memberMatches || roundMatches || subMatches;
  });

  const handleAllowLoginAll = async () => {
    if (!confirmUnlockAll) {
      setConfirmUnlockAll(true);
      setTimeout(() => setConfirmUnlockAll(false), 5000);
      return;
    }

    setConfirmUnlockAll(false);
    setUnlockingAll(true);
    try {
      const msg = await forceLogoutAllTeams(teams);
      onToast(msg || 'All teams unlocked successfully!', 'success');
      fetchTeams();
    } catch (err) {
      onToast(`Failed to unlock all teams: ${err.message}`, 'error');
    } finally {
      setUnlockingAll(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">👥 Manage Teams</h2>
        <p className="section-subtitle">Register or remove squads from the gauntlet</p>
      </div>

      <div className="grid-2 fade-in fade-in-delay-1" style={{ marginBottom: '1.5rem' }}>
        <CreateTeamPanel onToast={handleToast} />
        <DeleteTeamPanel onToast={handleToast} teams={teams} />
      </div>

      <div className="card fade-in fade-in-delay-2">
        <div className="refresh-row" style={{ flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div className="admin-search-wrapper">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search team, member, round..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {search && (
              <span className="admin-search-meta">
                Showing {filteredTeams.length} of {teams.length}
              </span>
            )}
            <button
              id="btn-allow-login-all"
              className={`btn btn-sm ${confirmUnlockAll ? 'btn-danger' : 'btn-ghost'}`}
              style={confirmUnlockAll ? {} : { color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.35)' }}
              onClick={handleAllowLoginAll}
              disabled={loading || unlockingAll || teams.length === 0}
              title="Reset login status for all teams so anyone can log in again"
            >
              {unlockingAll ? 'Unlocking...' : confirmUnlockAll ? '⚠ Confirm Unlock All?' : '🔓 Allow Login All'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={fetchTeams} disabled={loading || unlockingAll}>
              {loading ? '...' : '↻ Refresh'}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && teams.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-state-icon">💎</div>
            <div className="empty-state-text">No squads registered yet.</div>
          </div>
        )}

        {!loading && teams.length > 0 && filteredTeams.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-text">No squads match "{search}"</div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setSearch('')}
            >
              Clear Search
            </button>
          </div>
        )}

        {filteredTeams.length > 0 && (
          <div className="table-responsive">
            <ManageTeamsTable teams={filteredTeams} allTeams={teams} onToast={handleToast} />
          </div>
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
