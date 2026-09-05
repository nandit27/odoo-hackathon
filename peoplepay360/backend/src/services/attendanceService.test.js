require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert");

const { computeWorkedHours, scopeToActor } = require("./attendanceService");

const at = (hhmm) => new Date(`2026-02-10T${hhmm}:00.000Z`);

test("workedHours is the checkIn/checkOut gap in hours", () => {
  assert.strictEqual(computeWorkedHours(at("09:00"), at("17:00")), 8);
  assert.strictEqual(computeWorkedHours(at("09:00"), at("12:30")), 3.5);
});

test("workedHours rounds to two decimals so it fits Decimal(5,2)", () => {
  // 09:00–16:50 = 7h50m = 7.8333…h
  assert.strictEqual(computeWorkedHours(at("09:00"), at("16:50")), 7.83);
});

test("an open day has no workedHours rather than zero", () => {
  assert.strictEqual(computeWorkedHours(at("09:00"), null), null);
  assert.strictEqual(computeWorkedHours(at("09:00"), undefined), null);
});

test("rejects a checkOut at or before checkIn", () => {
  assert.throws(() => computeWorkedHours(at("17:00"), at("09:00")), /must be after/);
  assert.throws(() => computeWorkedHours(at("09:00"), at("09:00")), /must be after/);
  assert.throws(
    () => computeWorkedHours(at("09:00"), at("09:00")),
    (err) => err.status === 400
  );
});

const hr = { userId: 1, role: "HR_MANAGER", employeeId: null };
const admin = { userId: 2, role: "ADMIN", employeeId: null };
const staff = { userId: 3, role: "EMPLOYEE", employeeId: 42 };

test("HR staff read every employee, or one when they ask for one", () => {
  assert.strictEqual(scopeToActor(hr, undefined), undefined, "no filter");
  assert.strictEqual(scopeToActor(admin, ""), undefined, "blank query param is not a filter");
  assert.strictEqual(scopeToActor(hr, "42"), 42, "query param is coerced to a number");
});

test("an employee is pinned to their own records", () => {
  assert.strictEqual(scopeToActor(staff, undefined), 42, "unfiltered request is narrowed");
  assert.strictEqual(scopeToActor(staff, "42"), 42, "asking for themselves is allowed");
  assert.throws(() => scopeToActor(staff, "43"), /only access your own/);
  assert.throws(
    () => scopeToActor(staff, "43"),
    (err) => err.status === 403
  );
});

test("an unrecognised role gets no broad access", () => {
  // Fail closed: a role added to the enum later must be listed in HR_ROLES to read widely.
  assert.throws(() => scopeToActor({ role: "AUDITOR", employeeId: null }, undefined), /not linked/);
});

test("an unlinked non-HR user cannot read anything", () => {
  assert.throws(
    () => scopeToActor({ userId: 4, role: "EMPLOYEE", employeeId: null }, undefined),
    (err) => err.status === 403 && /not linked/.test(err.message)
  );
  assert.throws(() => scopeToActor(undefined, undefined), /not linked/);
});

test("a malformed employeeId filter is rejected before it reaches the query", () => {
  assert.throws(() => scopeToActor(hr, "abc"), /positive integer/);
  assert.throws(() => scopeToActor(hr, "0"), /positive integer/);
});
