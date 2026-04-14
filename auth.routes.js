const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ REGISTRIEREN
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Fehlende Daten" });

  const hash = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hash],
    err => {
      if (err) return res.status(400).json({ error: "User existiert bereits" });
      res.json({ success: true });
    }
  );
});

// ✅ LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (!user)
        return res.status(401).json({ error: "Falsche Zugangsdaten" });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok)
        return res.status(401).json({ error: "Falsche Zugangsdaten" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({ token, role: user.role });
    }
  );
});

module.exports = router;