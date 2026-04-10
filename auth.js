const API_URL = "https://DEIN-SERVICE.onrender.com";
const TOKEN_KEY = "angler_auth_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
function isLoggedIn() {
  return !!getToken();
}

// LOGIN
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

// REGISTER
async function registerUser(username, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const err = await res.json();
    return { success: false, message: err.error };
  }
  return { success: true };
}

// ROLE
async function getMyRole() {
  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: "Bearer " + getToken() }
  });
  if (!res.ok) return "guest";
  const data = await res.json();
  return data.role;
}

function logout() {
  clearToken();
  window.location.href = "login.html";
}
