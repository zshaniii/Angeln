const API_URL = "https://angeln.onrender.com";
const TOKEN_KEY = "angler_auth_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
function isLoggedIn() {
  return !!getToken();
}

// LOGIN
async function loginUser(username, password) {
  const r = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!r.ok) return false;
  const d = await r.json();
  setToken(d.token);
  return true;
}

// REGISTER
async function registerUser(username, password) {
  const r = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!r.ok) {
    const e = await r.json();
    return { success: false, message: e.error };
  }
  return { success: true };
}

// PROFIL
async function loadProfile() {
  const r = await fetch(`${API_URL}/profile`, {
    headers: { Authorization: "Bearer " + getToken() }
  });
  return r.ok ? await r.json() : null;
}

async function saveProfile(p) {
  return fetch(`${API_URL}/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken()
    },
    body: JSON.stringify(p)
  });
}

// LOGOUT
function logout() {
  clearToken();
  location.href = "login.html";
}
``
