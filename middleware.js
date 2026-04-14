const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function authRequired(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Kein Token" });

  try {
    const token = auth.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Ungültiger Token" });
  }
}

module.exports = authRequired;
