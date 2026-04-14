const API = "https://angeln.onrender.com/api/auth";

// ✅ REGISTRIEREN
async function register(email, password) {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const e = await res.json();
    alert(e.error || "Registrierung fehlgeschlagen");
    return false;
  }
  return true;
}

// ✅ LOGIN
async function login(email, password) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.error);
    return false;
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  return true;
}

// ✅ STATUS
function isLoggedIn() {
  return !!localStorage.getItem("token");
}

function isPro() {
  return localStorage.getItem("role") === "pro";
}

function logout() {
  localStorage.clear();
  window.location.href = "welcome.html";
}
