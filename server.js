const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

const db = new sqlite3.Database("./users.db");

// Tabelle mit Profilfeldern
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    passwordHash TEXT,
    role TEXT,
    fullName TEXT,
    email TEXT,
    location TEXT,
    bio TEXT,
    avatar TEXT
  )
`);

// Admin einmalig anlegen
(async () => {
  const hash = await bcrypt.hash("ADMIN_PASSWORT_HIER", 12);
  db.run(
    `INSERT OR IGNORE INTO users (username, passwordHash, role)
     VALUES ('admin', ?, 'admin')`,
    [hash]
  );
})();

// Auth Middleware
function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.sendStatus(401);
  try {
    req.user = jwt.verify(h.split(" ")[1], JWT_SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (_, user) => {
      if (!user) return res.sendStatus(401);
      if (!(await bcrypt.compare(password, user.passwordHash)))
        return res.sendStatus(401);

      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.json({ token });
    }
  );
});

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.sendStatus(400);

  db.get(
    "SELECT id FROM users WHERE username = ?",
    [username],
    async (_, exists) => {
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

// PROFIL LADEN
app.get("/profile", auth, (req, res) => {
  db.get(
    "SELECT username, role, fullName, email, location, bio, avatar FROM users WHERE id = ?",
    [req.user.id],
    (_, row) => row ? res.json(row) : res.sendStatus(404)
  );
});

// PROFIL SPEICHERN
app.post("/profile", auth, (req, res) => {
  const { fullName, email, location, bio, avatar } = req.body;
  db.run(
    `UPDATE users
     SET fullName=?, email=?, location=?, bio=?, avatar=?
     WHERE id=?`,
    [
      fullName || "",
      email || "",
      location || "",
      bio || "",
      avatar || "",
      req.user.id
    ],
    () => res.json({ success: true })
  );
});

app.listen(PORT, () => {
  console.log("Backend läuft auf Port", PORT);
});
``
