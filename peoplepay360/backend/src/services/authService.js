const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Role } = require("@prisma/client");
const prisma = require("../prisma/client");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";
const BCRYPT_ROUNDS = 10;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set — add it to backend/.env before starting the API");
}

const PUBLIC_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  employeeId: true,
  createdAt: true,
};

function httpError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    createdAt: user.createdAt,
  };
}

// allowRole guards privilege escalation: a self-registering caller cannot pick its own role.
async function register(data, { allowRole = false } = {}) {
  const { name, email, password, role, employeeId } = data || {};

  if (!name || !email || !password) {
    throw httpError("name, email and password are required");
  }
  if (typeof password !== "string" || password.length < 8) {
    throw httpError("password must be at least 8 characters");
  }
  if (role !== undefined && !Object.values(Role).includes(role)) {
    throw httpError(`role must be one of: ${Object.values(Role).join(", ")}`);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw httpError("email already registered", 409);
  }

  let linkedEmployeeId = null;
  if (employeeId !== undefined && employeeId !== null && employeeId !== "") {
    linkedEmployeeId = Number(employeeId);
    if (!Number.isInteger(linkedEmployeeId)) {
      throw httpError("employeeId must be an integer");
    }
    const employee = await prisma.employee.findUnique({ where: { id: linkedEmployeeId } });
    if (!employee) {
      throw httpError("employee not found", 404);
    }
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    return await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: allowRole && role ? role : Role.EMPLOYEE,
        employeeId: linkedEmployeeId,
      },
      select: PUBLIC_FIELDS,
    });
  } catch (err) {
    if (err.code === "P2002") {
      throw httpError("email or employee is already linked to a user", 409);
    }
    throw err;
  }
}

async function login({ email, password } = {}) {
  if (!email || !password) {
    throw httpError("email and password are required");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Same message for unknown email and wrong password — avoids account enumeration.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw httpError("invalid email or password", 401);
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return { token, user: publicUser(user) };
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { register, login, verifyToken };
