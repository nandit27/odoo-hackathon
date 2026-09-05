require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert");

const { assertRulesConsistent, parseCode } = require("./salaryService");

// The seeded "Regular Salary" structure, which is also the shape the payroll engine will read.
const rule = (code, sequence, extra = {}) => ({
  code,
  sequence,
  computationType: "PERCENTAGE",
  percentageOfCode: "BASIC",
  ...extra,
});
const BASIC = rule("BASIC", 1, { computationType: "FIXED", percentageOfCode: null });
const HRA = rule("HRA", 2);
const PF = rule("PF", 3);

test("the seeded structure is consistent", () => {
  assert.deepStrictEqual(assertRulesConsistent([BASIC, HRA, PF]), [BASIC, HRA, PF]);
  assert.deepStrictEqual(assertRulesConsistent([]), [], "an empty structure is not yet wrong");
});

test("a code may only be used once per structure", () => {
  assert.throws(() => assertRulesConsistent([BASIC, HRA, rule("HRA", 4)]), /already used/);
  assert.throws(
    () => assertRulesConsistent([BASIC, HRA, rule("HRA", 4)]),
    (err) => err.status === 409
  );
});

test("a sequence may only be used once per structure", () => {
  // Renumbering to insert a rule between two others has to pass through a colliding state.
  assert.throws(() => assertRulesConsistent([BASIC, HRA, rule("BONUS", 2)]), /sequence 2/);
  assert.throws(
    () => assertRulesConsistent([BASIC, HRA, rule("BONUS", 2)]),
    (err) => err.status === 409
  );
});

test("a percentage must name a rule that exists in the same structure", () => {
  assert.throws(
    () => assertRulesConsistent([BASIC, rule("HRA", 2, { percentageOfCode: "GROSS" })]),
    /matches no rule code/
  );
  // Deleting BASIC out from under HRA is the same failure, seen from the other side.
  assert.throws(() => assertRulesConsistent([HRA, PF]), /matches no rule code/);
});

test("a rule cannot depend on a later one", () => {
  // The whole point: the engine resolves each percentage in one forward pass.
  assert.throws(
    () => assertRulesConsistent([BASIC, rule("HRA", 2, { percentageOfCode: "PF" }), PF]),
    /may only reference a lower sequence/
  );
});

test("a rule cannot depend on itself", () => {
  assert.throws(
    () => assertRulesConsistent([rule("HRA", 2, { percentageOfCode: "HRA" })]),
    /may only reference a lower sequence/
  );
});

test("a FIXED rule cannot carry a percentage base", () => {
  assert.throws(
    () => assertRulesConsistent([rule("BASIC", 1, { computationType: "FIXED" })]),
    /is FIXED/
  );
});

test("a PERCENTAGE without a base is left to the payroll engine", () => {
  // The spec calls percentageOfCode optional; what an absent base means (the contract wage) is a
  // payroll decision, so configuration does not refuse it.
  const wageBased = rule("HRA", 2, { percentageOfCode: null });
  assert.deepStrictEqual(assertRulesConsistent([wageBased]), [wageBased]);
});

test("codes are identifiers, normalised so percentageOfCode matches exactly", () => {
  assert.strictEqual(parseCode(" hra "), "HRA");
  assert.strictEqual(parseCode("NET_PAY"), "NET_PAY");
  assert.throws(() => parseCode("HRA-1"), /letters, digits and underscores/);
  assert.throws(() => parseCode(""), /code is required/);
  assert.throws(() => parseCode(undefined, "percentageOfCode"), /percentageOfCode is required/);
});
