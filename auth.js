// =============================
// CONFIG
// =============================
const API_URL = "https://DEIN-SERVICE.onrender.com"; 
const TOKEN_KEY = "angler_auth_token";

// =============================
// TOKEN HANDLING
// =============================
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// =============================
// AUTH STATUS
// =============================
function isLoggedIn() {
  return !!getToken();
}

// =============================
// LOGIN / LOGOUT
// =============================
async function loginUser(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) return false;

  const data = await res.json();
  setToken(data.token);
  return true;
}

function logout() {
  clearToken();
  window.location.href = "login.html";
}

// =============================
// ROLE CHECK (SERVER entscheidet)
// =============================
async function getMyRole() {
  const res = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: "Bearer " + getToken()
    }
  });

  if (!res.ok) return "guest";

  const data = await res.json();
  return data.role;
}

// =============================
// ADMIN CHECK
// =============================
async function isAdmin() {
  return (await getMyRole()) === "admin";
}

// =============================
// AUTH GUARD
// =============================
function ensureAuthRedirect(target = "login.html") {
  if (!isLoggedIn()) {
    window.location.href = target;
    return false;
  }
  return true;
}
