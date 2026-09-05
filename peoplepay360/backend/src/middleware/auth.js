const authService = require("../services/authService");

function bearerToken(req) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  return scheme === "Bearer" && token ? token : null;
}

function requireAuth(req, res, next) {
  const token = bearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }
  try {
    const { userId, role } = authService.verifyToken(token);
    req.user = { userId, role };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Like requireAuth, but anonymous requests continue with req.user undefined.
function optionalAuth(req, res, next) {
  const token = bearerToken(req);
  if (token) {
    try {
      const { userId, role } = authService.verifyToken(token);
      req.user = { userId, role };
    } catch (err) {
      // Bad token is treated as anonymous, not as an error.
    }
  }
  next();
}

function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient role" });
    }
    next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };
