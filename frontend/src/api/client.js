// Base API URL — adjust if your Spring Boot runs on a different port
const BASE_URL = 'http://localhost:8080';

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
export async function createTeam(teamName, password) {
  const res = await fetch(`${BASE_URL}/user/create/account`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ teamName, password }),
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
