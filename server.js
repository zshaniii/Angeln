// =======================
// Imports
// =======================
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

// =======================
// App
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

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    passwordHash TEXT,
    role TEXT
  )
`);

// =======================
// Admin einmal anlegen
// =======================
(async () => {
  const hash = await bcrypt.hash("ShaneFrank", 12);
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
    res.sendStatus(403);
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") return res.sendStatus(403);
  next();
}

// =======================
// Routes
// =======================
app.get("/", (req, res) => {
  res.send("Backend läuft ✅");
});

// -------- LOGIN --------
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

// -------- REGISTER --------
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Fehlende Daten" });

  if (username.length < 3 || password.length < 6)
    return res.status(400).json({
      error: "Username ≥ 3 Zeichen, Passwort ≥ 6 Zeichen"
    });

  db.get(
    "SELECT id FROM users WHERE username = ?",
    [username],
    async (err, exists) => {
      if (exists)
        return res.status(409).json({ error: "Benutzer existiert bereits" });

      const hash = await bcrypt.hash(password, 12);
      db.run(
        "INSERT INTO users (username, passwordHash, role) VALUES (?, ?, 'user')",
        [username, hash],
        () => res.json({ success: true })
      );
    }
  );
});

// -------- ME --------
app.get("/me", auth, (req, res) => {
  res.json({ role: req.user.role });
});

// -------- ADMIN --------
app.get("/admin/users", auth, adminOnly, (req, res) => {
  db.all("SELECT id, username, role FROM users", [], (e, rows) =>
    res.json(rows)
  );
});

app.post("/admin/set-role", auth, adminOnly, (req, res) => {
  const { userId, role } = req.body;
  db.run(
    "UPDATE users SET role = ? WHERE id = ?",
    [role, userId],
    () => res.json({ success: true })
  );
});

// =======================
// Start
// =======================
app.listen(PORT, () => {
  console.log("Server läuft auf Port", PORT);
});
