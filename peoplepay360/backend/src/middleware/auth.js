const authService = require("../services/authService");
const { HR_ROLES, PAYROLL_READ_ROLES, PAYROLL_WRITE_ROLES } = require("../utils/scope");

function bearerToken(req) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  return scheme === "Bearer" && token ? token : null;
}

// employeeId defaults to null so tokens minted before it was added still yield a stable shape.
function actorFrom(token) {
  const { userId, role, employeeId = null } = authService.verifyToken(token);
  return { userId, role, employeeId };
}

function requireAuth(req, res, next) {
  const token = bearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }
  try {
    req.user = actorFrom(token);
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
      req.user = actorFrom(token);
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

const requireHrStaff = requireRole(...HR_ROLES);
const requirePayrollRead = requireRole(...PAYROLL_READ_ROLES);
const requirePayrollWrite = requireRole(...PAYROLL_WRITE_ROLES);

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole,
  requireHrStaff,
  requirePayrollRead,
  requirePayrollWrite,
  HR_ROLES,
};
