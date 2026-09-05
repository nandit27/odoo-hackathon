require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert");
const { Prisma } = require("@prisma/client");

const { computeDuration, balanceCeiling, withRemaining } = require("./timeOffService");

const D = (value) => new Prisma.Decimal(value);
const at = (day, hhmm = "00:00") => new Date(`2026-04-${String(day).padStart(2, "0")}T${hhmm}:00.000Z`);
const alloc = (allocated, taken) => ({ allocated: D(allocated), taken: D(taken) });

/* --------------------------------------------------------------- duration --- */

test("a DAYS type counts calendar days inclusively", () => {
  assert.strictEqual(computeDuration("DAYS", at(10), at(10)), 1, "one day off is 1, not 0");
  assert.strictEqual(computeDuration("DAYS", at(10), at(12)), 3);
  assert.strictEqual(computeDuration("DAYS", at(1), at(30)), 30);
});

test("a DAYS type ignores the time of day", () => {
  // Booking 09:00 Apr 10 to 17:00 Apr 11 is still two days off.
  assert.strictEqual(computeDuration("DAYS", at(10, "09:00"), at(11, "17:00")), 2);
  assert.strictEqual(computeDuration("DAYS", at(10, "23:59"), at(10, "00:01")), 1);
});

test("an HOURS type measures elapsed time to two decimals", () => {
  assert.strictEqual(computeDuration("HOURS", at(10, "09:00"), at(10, "17:00")), 8);
  assert.strictEqual(computeDuration("HOURS", at(10, "09:00"), at(10, "12:30")), 3.5);
  // 09:00–16:50 = 7h50m = 7.8333…h
  assert.strictEqual(computeDuration("HOURS", at(10, "09:00"), at(10, "16:50")), 7.83);
});

test("rejects an endDate before the startDate", () => {
  assert.throws(() => computeDuration("DAYS", at(12), at(10)), /on or after/);
  assert.throws(() => computeDuration("HOURS", at(12), at(10)), /after startDate/);
  assert.throws(
    () => computeDuration("DAYS", at(12), at(10)),
    (err) => err.status === 400
  );
});

test("an HOURS type rejects a zero-length request that DAYS would call one day", () => {
  assert.strictEqual(computeDuration("DAYS", at(10, "09:00"), at(10, "09:00")), 1);
  assert.throws(() => computeDuration("HOURS", at(10, "09:00"), at(10, "09:00")), /HOURS/);
});

/* ---------------------------------------------------------------- balance --- */

test("balanceCeiling admits a request that exactly empties the balance", () => {
  assert.strictEqual(balanceCeiling(alloc(20, 12), D(8)).toString(), "12");
  assert.strictEqual(balanceCeiling(alloc(20, 0), D(20)).toString(), "0");
});

test("balanceCeiling rejects one unit more than remaining", () => {
  assert.throws(() => balanceCeiling(alloc(20, 12), D(8.01)), /Insufficient balance/);
  assert.throws(() => balanceCeiling(alloc(20, 20), D(0.5)), /Insufficient balance/);
  assert.throws(
    () => balanceCeiling(alloc(20, 12), D(9)),
    (err) => err.status === 400 && err.message === "Insufficient balance"
  );
});

test("balanceCeiling rejects a request longer than the whole allocation", () => {
  assert.throws(() => balanceCeiling(alloc(5, 0), D(10)), /Insufficient balance/);
});

test("balances are exact, not floating point", () => {
  // 0.3 - 0.1 - 0.2 is -2.7e-17 in float maths, which would refuse a request that exactly fits.
  assert.strictEqual(balanceCeiling(alloc(0.3, 0.1), D(0.2)).toString(), "0.1");
  assert.strictEqual(withRemaining(alloc(0.3, 0.1)).remaining.toString(), "0.2");
});

test("remaining is derived from allocated - taken", () => {
  assert.strictEqual(withRemaining(alloc(25, 4.5)).remaining.toString(), "20.5");
  assert.strictEqual(withRemaining(alloc(25, 25)).remaining.toString(), "0");
});

test("the ceiling doubles as the concurrency guard for the increment", () => {
  // approve() writes `where: { taken: { lte: ceiling } }`. A rival approval that already moved
  // taken past the ceiling must make that predicate false.
  const ceiling = balanceCeiling(alloc(20, 12), D(8));
  assert.ok(D(12).lessThanOrEqualTo(ceiling), "the balance we read still passes");
  assert.ok(!D(12.5).lessThanOrEqualTo(ceiling), "a rival deduction of 0.5 fails the guard");
});
