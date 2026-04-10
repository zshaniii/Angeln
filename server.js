// =======================
// Imports
// =======================
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

// =======================
// App Setup
// =======================
const app = express();
app.use(cors());
app.use(express.json());

// =======================
// Config
// =======================
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// =======================
// Database
// =======================
const db = new sqlite3.Database("./users.db");

// Tabelle anlegen
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    passwordHash TEXT,
    role TEXT
  )
`);

// =======================
// ADMIN EINMALIG ANLEGEN
// =======================
(async () => {
  const adminPassword = "ADMIN_PASSWORT_HIER_ÄNDERN";
  const hash = await bcrypt.hash(adminPassword, 12);

  db.run(
    `INSERT OR IGNORE INTO users (username, passwordHash, role)
     VALUES ('admin', ?, 'admin')`,
    [hash]
  );
})();

// =======================
// Middleware
// =======================
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.sendStatus(401);

  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.sendStatus(403);
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") return res.sendStatus(403);
  next();
}

// =======================
// Routes
// =======================

// Test
app.get("/", (req, res) => {
  res.send("Backend läuft ✅");
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (!user) return res.status(401).json({ error: "Login falsch" });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: "Login falsch" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.json({ token });
    }
  );
});

// Admin: Alle User
app.get("/admin/users", auth, adminOnly, (req, res) => {
  db.all(
    "SELECT id, username, role FROM users",
    [],
    (err, rows) => {
      res.json(rows);
    }
  );
});

// Admin: Rolle ändern
app.post("/admin/set-role", auth, adminOnly, (req, res) => {
  const { userId, role } = req.body;

  db.run(
    "UPDATE users SET role = ? WHERE id = ?",
    [role, userId],
    () => res.json({ success: true })
  );
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
  console.log("Server läuft auf Port", PORT);
});
``
