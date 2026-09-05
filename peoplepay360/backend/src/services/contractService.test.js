require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert");

const { overlapWhere } = require("./contractService");

const jan = (day) => new Date(`2026-01-${String(day).padStart(2, "0")}T00:00:00.000Z`);

// Minimal evaluator for the operator subset overlapWhere emits, so the business rule can be
// checked against concrete date ranges without a database.
function matches(where, row) {
  return Object.entries(where).every(([key, cond]) => {
    if (key === "AND") return cond.every((sub) => matches(sub, row));
    if (key === "OR") return cond.some((sub) => matches(sub, row));

    const value = row[key];
    if (cond === null) return value === null;
    if (cond && typeof cond === "object") {
      if ("not" in cond) return value !== cond.not;
      if ("gte" in cond) return value !== null && value >= cond.gte;
      if ("lte" in cond) return value !== null && value <= cond.lte;
    }
    return value === cond;
  });
}

const contract = (id, from, to, extra = {}) => ({
  id,
  employeeId: 7,
  status: "ACTIVE",
  startDate: jan(from),
  endDate: to === null ? null : jan(to),
  ...extra,
});

test("scopes the search to the employee's other ACTIVE contracts", () => {
  const where = overlapWhere({ employeeId: 7, startDate: jan(10), endDate: jan(20), excludeId: 3 });

  assert.strictEqual(where.employeeId, 7);
  assert.strictEqual(where.status, "ACTIVE");
  assert.deepStrictEqual(where.id, { not: 3 });

  assert.strictEqual(matches(where, contract(3, 1, 31)), false, "the row being updated is skipped");
  assert.strictEqual(matches(where, contract(4, 1, 31, { employeeId: 8 })), false, "other employee");
  assert.strictEqual(
    matches(where, contract(5, 1, 31, { status: "EXPIRED" })),
    false,
    "expired contracts do not clash"
  );
});

test("omits the id filter when creating rather than updating", () => {
  const where = overlapWhere({ employeeId: 7, startDate: jan(10), endDate: jan(20) });
  assert.strictEqual(where.id, undefined);
});

test("a closed candidate range overlaps on boundaries but not outside them", () => {
  const where = overlapWhere({ employeeId: 7, startDate: jan(10), endDate: jan(20) });

  assert.strictEqual(matches(where, contract(1, 1, 9)), false, "ends the day before");
  assert.strictEqual(matches(where, contract(2, 1, 10)), true, "ends on the first day");
  assert.strictEqual(matches(where, contract(3, 12, 15)), true, "fully inside");
  assert.strictEqual(matches(where, contract(4, 20, 31)), true, "starts on the last day");
  assert.strictEqual(matches(where, contract(5, 21, 31)), false, "starts the day after");
  assert.strictEqual(matches(where, contract(6, 1, null)), true, "open-ended and already running");
  assert.strictEqual(matches(where, contract(7, 25, null)), false, "open-ended but starts later");
});

test("an open-ended candidate collides with anything that has not already ended", () => {
  const where = overlapWhere({ employeeId: 7, startDate: jan(10), endDate: null });

  // The literal SQL rule would compare startDate <= NULL here and match nothing, so the
  // startDate clause is dropped instead.
  assert.strictEqual(where.AND.length, 1);

  assert.strictEqual(matches(where, contract(1, 1, 9)), false, "already ended");
  assert.strictEqual(matches(where, contract(2, 1, 10)), true, "ends on the first day");
  assert.strictEqual(matches(where, contract(3, 21, 31)), true, "starts later, candidate is open");
  assert.strictEqual(matches(where, contract(4, 25, null)), true, "both open-ended");
});
