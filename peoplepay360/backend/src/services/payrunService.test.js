require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert");
const { Prisma } = require("@prisma/client");
const { applicableContractWhere, calculateLines } = require("./payrunService");

const D = (value) => new Prisma.Decimal(value);

test("active contract eligibility uses inclusive period overlap", () => {
  const where = applicableContractWhere(7, {
    periodStart: new Date("2026-09-01"),
    periodEnd: new Date("2026-09-30"),
  });
  assert.strictEqual(where.employeeId, 7);
  assert.strictEqual(where.status, "ACTIVE");
  assert.strictEqual(where.startDate.lte.toISOString().slice(0, 10), "2026-09-30");
  assert.deepStrictEqual(where.OR[0], { endDate: null });
  assert.strictEqual(where.OR[1].endDate.gte.toISOString().slice(0, 10), "2026-09-01");
});

test("salary rules are evaluated in sequence and totals use categories", () => {
  const rules = [
    { id: 1, code: "BASIC", name: "Basic", category: "BASIC", computationType: "FIXED", value: D(30000) },
    { id: 2, code: "HRA", name: "HRA", category: "ALLOWANCE", computationType: "PERCENTAGE", value: D(40), percentageOfCode: "BASIC" },
    { id: 3, code: "PF", name: "PF", category: "DEDUCTION", computationType: "PERCENTAGE", value: D(12), percentageOfCode: "BASIC" },
  ];
  const result = calculateLines(rules, D(0));
  assert.deepStrictEqual(result.lines.map((line) => line.amount.toString()), ["30000", "12000", "3600"]);
  assert.strictEqual(result.gross.toString(), "42000");
  assert.strictEqual(result.deductions.toString(), "3600");
});
