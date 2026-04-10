const API_URL = "https://angeln.onrender.com";
const TOKEN_KEY = "angler_auth_token";

// Token
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

// Login
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

// Registrierung
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

// Rolle
async function getMyRole() {
  const r = await fetch(`${API_URL}/me`, {
    headers: { Authorization: "Bearer " + getToken() }
  });
  if (!r.ok) return "guest";
  return (await r.json()).role;
}

// Logout
function logout() {
  clearToken();
  location.href = "login.html";
}
``
