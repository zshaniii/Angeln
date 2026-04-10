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

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    passwordHash TEXT,
    role TEXT
  )
`);

(async () => {
  const hash = await bcrypt.hash("ADMIN_PASSWORT_HIER", 12);
  db.run(
    `INSERT OR IGNORE INTO users (username, passwordHash, role)
     VALUES ('admin', ?, 'admin')`,
    [hash]
  );
})();

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.sendStatus(401);
  try {
    req.user = jwt.verify(header.split(" ")[1], JWT_SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], async (_, user) => {
    if (!user) return res.sendStatus(401);
    if (!(await bcrypt.compare(password, user.passwordHash)))
      return res.sendStatus(401);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.json({ token });
  });
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.sendStatus(400);

  db.get("SELECT id FROM users WHERE username = ?", [username], async (_, row) => {
    if (row) return res.status(409).json({ error: "Benutzer existiert" });
    const hash = await bcrypt.hash(password, 12);
    db.run(
      "INSERT INTO users (username, passwordHash, role) VALUES (?, ?, 'user')",
      [username, hash],
      () => res.json({ success: true })
    );
  });
});

app.get("/me", auth, (req, res) => {
  res.json({ role: req.user.role });
});

app.listen(PORT, () =>
  console.log("Backend läuft auf Port", PORT)
);
``
