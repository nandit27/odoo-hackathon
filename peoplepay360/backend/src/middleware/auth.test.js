// Offline check for the JWT/role guards — no database needed.
// Run with: npm test   (from backend/)
process.env.JWT_SECRET = "test-secret-not-used-in-production";

const test = require("node:test");
const assert = require("node:assert");
const jwt = require("jsonwebtoken");

const { requireAuth, optionalAuth, requireRole } = require("./auth");

function fakeRes() {
  const res = { statusCode: null, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
}

function run(middleware, req) {
  const res = fakeRes();
  let nextCalled = false;
  middleware(req, res, () => {
    nextCalled = true;
  });
  return { res, nextCalled };
}

const adminToken = jwt.sign({ userId: 1, role: "ADMIN" }, process.env.JWT_SECRET);
const employeeToken = jwt.sign({ userId: 2, role: "EMPLOYEE" }, process.env.JWT_SECRET);

test("requireAuth attaches req.user for a valid token", () => {
  const req = { headers: { authorization: `Bearer ${adminToken}` } };
  const { nextCalled } = run(requireAuth, req);
  assert.ok(nextCalled);
  assert.deepStrictEqual(req.user, { userId: 1, role: "ADMIN" });
});

test("requireAuth rejects a missing token", () => {
  const { res, nextCalled } = run(requireAuth, { headers: {} });
  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.statusCode, 401);
});

test("requireAuth rejects a token signed with another secret", () => {
  const forged = jwt.sign({ userId: 3, role: "ADMIN" }, "wrong-secret");
  const req = { headers: { authorization: `Bearer ${forged}` } };
  const { res, nextCalled } = run(requireAuth, req);
  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(req.user, undefined);
});

test("requireAuth rejects an expired token", () => {
  const expired = jwt.sign({ userId: 4, role: "ADMIN" }, process.env.JWT_SECRET, {
    expiresIn: "-1s",
  });
  const req = { headers: { authorization: `Bearer ${expired}` } };
  const { res } = run(requireAuth, req);
  assert.strictEqual(res.statusCode, 401);
});

test("optionalAuth lets anonymous and bad-token requests through as anonymous", () => {
  const anon = { headers: {} };
  assert.ok(run(optionalAuth, anon).nextCalled);
  assert.strictEqual(anon.user, undefined);

  const bad = { headers: { authorization: "Bearer not-a-jwt" } };
  assert.ok(run(optionalAuth, bad).nextCalled);
  assert.strictEqual(bad.user, undefined);
});

test("requireRole allows listed roles and blocks the rest", () => {
  const guard = requireRole("ADMIN", "HR_MANAGER");

  const admin = { user: { userId: 1, role: "ADMIN" } };
  assert.ok(run(guard, admin).nextCalled);

  const employee = { user: { userId: 2, role: "EMPLOYEE" } };
  const blocked = run(guard, employee);
  assert.strictEqual(blocked.nextCalled, false);
  assert.strictEqual(blocked.res.statusCode, 403);

  const anon = {};
  const unauthenticated = run(guard, anon);
  assert.strictEqual(unauthenticated.nextCalled, false);
  assert.strictEqual(unauthenticated.res.statusCode, 401);
});

test("login-shaped payload round-trips userId and role", () => {
  const decoded = jwt.verify(employeeToken, process.env.JWT_SECRET);
  assert.strictEqual(decoded.userId, 2);
  assert.strictEqual(decoded.role, "EMPLOYEE");
});
