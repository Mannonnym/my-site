// middleware/auth.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = "supersecretkey"; // ممكن تخليه في env file

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1]; // "Bearer TOKEN"
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user; // attach بيانات المستخدم من التوكن
    next();
  });
}

module.exports = authMiddleware;
