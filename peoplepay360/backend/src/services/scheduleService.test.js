require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert");

const { calcWeeklyHours } = require("./scheduleService");

const shift = (day, startTime, endTime, breakMinutes) => ({
  day,
  startTime,
  endTime,
  breakMinutes,
});

test("sums (end - start - break) across every day in the pattern", () => {
  const pattern = [
    shift("monday", "09:00", "17:00", 60), // 7h
    shift("tuesday", "09:00", "17:00", 60), // 7h
    shift("wednesday", "09:00", "13:00", 0), // 4h
  ];
  assert.strictEqual(calcWeeklyHours(pattern), 18);
});

test("treats a missing breakMinutes as zero", () => {
  const pattern = [{ day: "monday", startTime: "08:30", endTime: "12:00" }];
  assert.strictEqual(calcWeeklyHours(pattern), 3.5);
});

test("rounds to two decimals so it fits Decimal(5,2)", () => {
  // 08:00–16:00 minus a 50 minute break = 430 minutes = 7.1666…h
  assert.strictEqual(calcWeeklyHours([shift("monday", "08:00", "16:00", 50)]), 7.17);
});

test("rejects a pattern that is empty or not an array", () => {
  assert.throws(() => calcWeeklyHours([]), /non-empty array/);
  assert.throws(() => calcWeeklyHours(undefined), /non-empty array/);
  assert.throws(() => calcWeeklyHours({ day: "monday" }), /non-empty array/);
});

test("rejects endTime at or before startTime", () => {
  assert.throws(() => calcWeeklyHours([shift("monday", "17:00", "09:00", 0)]), /must be after/);
  assert.throws(() => calcWeeklyHours([shift("monday", "09:00", "09:00", 0)]), /must be after/);
});

test("rejects malformed or out-of-range times", () => {
  assert.throws(() => calcWeeklyHours([shift("monday", "9am", "17:00", 0)]), /HH:MM/);
  assert.throws(() => calcWeeklyHours([shift("monday", "24:00", "25:00", 0)]), /HH:MM/);
  assert.throws(() => calcWeeklyHours([shift("monday", "09:60", "17:00", 0)]), /HH:MM/);
});

test("rejects a break that swallows the shift, and negative breaks", () => {
  assert.throws(
    () => calcWeeklyHours([shift("monday", "09:00", "10:00", 60)]),
    /leaves no working time/
  );
  assert.throws(
    () => calcWeeklyHours([shift("monday", "09:00", "10:00", -15)]),
    /non-negative integer/
  );
});

test("requires a day label on each entry", () => {
  assert.throws(
    () => calcWeeklyHours([{ startTime: "09:00", endTime: "17:00" }]),
    /day is required/
  );
});

test("validation failures carry a 400 status for errorHandler", () => {
  assert.throws(
    () => calcWeeklyHours([]),
    (err) => err.status === 400
  );
});
