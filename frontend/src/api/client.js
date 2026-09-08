const BASE_URL = '';

function getToken() {
  return localStorage.getItem('ite_token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  };
}

/** Decode JWT payload (no verification — client-side only) */
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function getRole() {
  const token = getToken();
  if (!token) return null;
  const payload = decodeToken(token);
  // scope is stored as "ROLE_ADMIN" or "ROLE_USER"
  return payload?.scope ?? null;
}

export function isAdmin() {
  return getRole() === 'ROLE_ADMIN';
}

export function logout() {
  localStorage.removeItem('ite_token');
}

/** POST /api/user/login */
export async function login(teamName, password) {
  const res = await fetch(`${BASE_URL}/api/user/login`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, password }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Login failed');
  }
  const data = await res.json();
  localStorage.setItem('ite_token', data.token);
  return data.token;
}

/** GET /get/statistics */
export async function getStatistics() {
  const res = await fetch(`${BASE_URL}/get/statistics`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** POST /user/create/account */
export async function createTeam(teamName, password, teamMembers) {
  const res = await fetch(`${BASE_URL}/user/create/account`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ teamName, password, teamMembers }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

/** DELETE /user/delete/account?id={id} */
export async function deleteTeam(id) {
  const res = await fetch(`${BASE_URL}/user/delete/account?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

/** GET /get/ack/nextRound?roundProgression={round} */
export async function getAckRound(round) {
  const res = await fetch(`${BASE_URL}/get/ack/nextRound?roundProgression=${round}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // Returns boolean
}

/** PUT /update/startMission */
export async function startMission() {
  const res = await fetch(`${BASE_URL}/update/startMission`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

/** GET /get/ack/nextSubRound?subRound={subRound} */
export async function getAckSubRound(subRound) {
  const res = await fetch(`${BASE_URL}/get/ack/nextSubRound?subRound=${subRound}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // Returns boolean
}

/** PUT /update/round/stats?roundProgression={round} */
export async function updateRound(round) {
  const res = await fetch(`${BASE_URL}/update/round/stats?roundProgression=${round}`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

/** PUT /update/subround/stats?subRound={subRound} */
export async function updateSubRound(subRound) {
  const res = await fetch(`${BASE_URL}/update/subround/stats?subRound=${subRound}`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

/** GET /get/round/detail */
export async function getRoundStatus() {
  const res = await fetch(`${BASE_URL}/get/round/detail`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text.replace(/"/g, '').trim();
}

/** GET /get/mission/started */
export async function getMissionStarted() {
  const res = await fetch(`${BASE_URL}/get/mission/started`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.text()) === 'true';
}

/** GET /get/team/members */
export async function getTeamMembers() {
  const res = await fetch(`${BASE_URL}/get/team/members`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** PUT /team/isLogged/change?teamId={id} */
export async function forceLogoutTeam(teamId) {
  const res = await fetch(`${BASE_URL}/team/isLogged/change?teamId=${encodeURIComponent(teamId)}`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}
