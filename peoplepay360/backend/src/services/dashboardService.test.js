require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert");
const { filters, payrunWhere } = require("./dashboardService");

test("dashboard period filters use inclusive payrun overlap", () => {
  const input = filters({ periodStart: "2026-09-01", periodEnd: "2026-09-30", department: " Engineering " });
  const where = payrunWhere(input);
  assert.strictEqual(where.periodStart.lte.toISOString().slice(0, 10), "2026-09-30");
  assert.strictEqual(where.periodEnd.gte.toISOString().slice(0, 10), "2026-09-01");
  assert.strictEqual(input.department, "Engineering");
});

test("dashboard requires a valid ordered period", () => {
  assert.throws(() => filters({ periodStart: "2026-09-30", periodEnd: "2026-09-01" }), /on or after/);
  assert.throws(() => filters({ periodStart: "2026-09-01" }), /are required/);
});
