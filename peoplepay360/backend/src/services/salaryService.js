const { SalaryRuleCategory, ComputationType } = require("@prisma/client");
const prisma = require("../prisma/client");
const {
  httpError,
  parseId,
  parseText,
  parseBoolean,
  enumValue,
} = require("../utils/validate");

const MAX_VALUE = 9999999999.99; // Decimal(12,2)
const CODE_PATTERN = /^[A-Z0-9_]+$/;

const round2 = (value) => Math.round(value * 100) / 100;

// The payroll engine keys rules by `code`, so a code is an identifier and not prose: trimmed and
// uppercased on the way in, which is also what makes a percentageOfCode lookup an exact match.
function parseCode(value, label = "code") {
  const code = parseText(value, label).toUpperCase();
  if (!CODE_PATTERN.test(code)) {
    throw httpError(`${label} must contain only letters, digits and underscores`);
  }
  return code;
}

// FIXED reads `value` as an amount, PERCENTAGE as a percent of its base. A DEDUCTION is a positive
// number too — the category, not the sign, tells the engine which way it moves the total.
function parseValue(value) {
  if (value === null || value === undefined || value === "") {
    throw httpError("value is required");
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw httpError("value must be a non-negative number");
  }
  if (amount > MAX_VALUE) {
    throw httpError(`value must not exceed ${MAX_VALUE}`);
  }
  return round2(amount);
}

// `partial` is the PUT path: only the supplied keys are parsed, and the merged row is what gets
// validated. structureId is deliberately absent — moving a rule between structures would have to
// revalidate both, so it is a delete-and-recreate rather than an edit.
function parseRuleFields(data = {}, partial = false) {
  const wanted = (field) => !partial || field in data;
  const row = {};

  if (wanted("name")) row.name = parseText(data.name, "name");
  if (wanted("code")) row.code = parseCode(data.code);
  if (wanted("category")) row.category = enumValue(SalaryRuleCategory, data.category, "category");
  if (wanted("sequence")) row.sequence = parseId(data.sequence, "sequence");
  if (wanted("computationType")) {
    row.computationType = enumValue(ComputationType, data.computationType, "computationType");
  }
  if (wanted("value")) row.value = parseValue(data.value);
  if (wanted("percentageOfCode")) {
    row.percentageOfCode = data.percentageOfCode
      ? parseCode(data.percentageOfCode, "percentageOfCode")
      : null;
  }
  return row;
}

// The one rule of the structure: the payroll engine walks rules in `sequence` order and resolves
// each PERCENTAGE against a base it has already computed. Everything below exists to keep that
// single forward pass possible — unique codes to key by, unique sequences to order by, and
// dependencies that only ever point backwards (which is also what makes the graph acyclic).
//
// Takes the whole rule set, not one row, because a rule is only valid relative to its siblings.
function assertRulesConsistent(rules) {
  const byCode = new Map();
  const bySequence = new Map();

  for (const rule of rules) {
    if (byCode.has(rule.code)) {
      throw httpError(`code ${rule.code} is already used in this structure`, 409);
    }
    if (bySequence.has(rule.sequence)) {
      throw httpError(
        `sequence ${rule.sequence} is already used by ${bySequence.get(rule.sequence).code} ` +
          "in this structure",
        409
      );
    }
    // A FIXED amount has no base, so a percentageOfCode on it is config the engine would ignore.
    if (rule.computationType === ComputationType.FIXED && rule.percentageOfCode) {
      throw httpError(
        `rule ${rule.code} is FIXED, so it cannot set percentageOfCode ` +
          `(${rule.percentageOfCode})`
      );
    }
    byCode.set(rule.code, rule);
    bySequence.set(rule.sequence, rule);
  }

  // Second pass: every code in the set is known by now, so a dangling reference is a real one and
  // not just a rule that happens to be declared later in the array.
  for (const rule of rules) {
    if (!rule.percentageOfCode) continue;

    const base = byCode.get(rule.percentageOfCode);
    if (!base) {
      throw httpError(
        `percentageOfCode ${rule.percentageOfCode} on rule ${rule.code} matches no rule code ` +
          "in this structure"
      );
    }
    // >= rather than >: a rule pointing at itself has an equal sequence and is just as unpayable.
    if (base.sequence >= rule.sequence) {
      throw httpError(
        `rule ${rule.code} (sequence ${rule.sequence}) cannot depend on ${base.code} ` +
          `(sequence ${base.sequence}): a percentage may only reference a lower sequence`
      );
    }
  }

  return rules;
}

// Validates the structure as it will look after the write, not just the row being written: a
// renumbered sequence or a renamed code can invalidate a sibling that points at it.
// ponytail: check-then-write, so two concurrent rule writes can both pass this. The
// @@unique([structureId, code]) / ([structureId, sequence]) indexes catch the collisions; a forward
// reference sneaking through needs a SERIALIZABLE transaction or a lock on the structure row.
async function assertStructureValidWith(tx, structureId, row) {
  const siblings = await tx.salaryRule.findMany({ where: { structureId } });
  assertRulesConsistent([...siblings.filter((sibling) => sibling.id !== row.id), row]);
}

/* ------------------------------------------------------------- structures --- */

// Rules ride along in sequence order: that is the shape the payroll engine wants, so a caller
// never has to fetch a structure and its rules separately and re-sort them.
const WITH_RULES = { rules: { orderBy: { sequence: "asc" } } };

async function findStructures() {
  return prisma.salaryStructure.findMany({ include: WITH_RULES, orderBy: { name: "asc" } });
}

async function findStructureById(idParam) {
  const id = parseId(idParam);
  const structure = await prisma.salaryStructure.findUnique({
    where: { id },
    include: WITH_RULES,
  });
  if (!structure) {
    throw httpError(`salary structure ${id} not found`, 404);
  }
  return structure;
}

async function createStructure(data = {}) {
  return prisma.salaryStructure.create({
    data: {
      name: parseText(data.name, "name"),
      active: data.active === undefined ? true : parseBoolean(data.active, "active"),
    },
    include: WITH_RULES,
  });
}

async function updateStructure(idParam, data = {}) {
  const id = parseId(idParam);
  const patch = {};
  if ("name" in data) patch.name = parseText(data.name, "name");
  if ("active" in data) patch.active = parseBoolean(data.active, "active");
  if (Object.keys(patch).length === 0) {
    throw httpError("no updatable fields provided");
  }
  // Deactivating a structure does not touch contracts already pointing at it — the payroll engine
  // decides what an inactive structure means for a run, this is only configuration.
  return prisma.salaryStructure.update({ where: { id }, data: patch, include: WITH_RULES });
}

async function removeStructure(idParam) {
  const id = parseId(idParam);
  const contracts = await prisma.contract.count({ where: { salaryStructureId: id } });
  if (contracts > 0) {
    throw httpError(
      `salary structure ${id} is used by ${contracts} contract(s); deactivate it instead`,
      409
    );
  }
  // Its rules cascade: they are meaningless without the structure, and no contract can be paid
  // from it. A missing id surfaces as a 404 through the Prisma P2025 mapping.
  await prisma.salaryStructure.delete({ where: { id } });
  return { deleted: id };
}

/* ------------------------------------------------------------------ rules --- */

async function findRules({ structureId } = {}) {
  const where = {};
  if (structureId !== undefined && structureId !== "") {
    where.structureId = parseId(structureId, "structureId");
  }
  return prisma.salaryRule.findMany({
    where,
    orderBy: [{ structureId: "asc" }, { sequence: "asc" }],
  });
}

async function findRuleById(idParam) {
  const id = parseId(idParam);
  const rule = await prisma.salaryRule.findUnique({ where: { id } });
  if (!rule) {
    throw httpError(`salary rule ${id} not found`, 404);
  }
  return rule;
}

async function createRule(data = {}) {
  const structureId = parseId(data.structureId, "structureId");
  const row = parseRuleFields(data);

  return prisma.$transaction(async (tx) => {
    const structure = await tx.salaryStructure.findUnique({ where: { id: structureId } });
    if (!structure) {
      throw httpError(`salary structure ${structureId} not found`, 404);
    }
    await assertStructureValidWith(tx, structureId, row);
    return tx.salaryRule.create({ data: { ...row, structureId } });
  });
}

async function updateRule(idParam, data = {}) {
  const id = parseId(idParam);
  const patch = parseRuleFields(data, true);
  if (Object.keys(patch).length === 0) {
    throw httpError("no updatable fields provided");
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.salaryRule.findUnique({ where: { id } });
    if (!existing) {
      throw httpError(`salary rule ${id} not found`, 404);
    }
    // Renaming a code that a sibling points at fails here rather than leaving a dangling
    // percentageOfCode: repoint the dependent first, then rename.
    await assertStructureValidWith(tx, existing.structureId, { ...existing, ...patch });
    return tx.salaryRule.update({ where: { id }, data: patch });
  });
}

async function removeRule(idParam) {
  const rule = await findRuleById(idParam);

  // Deleting a base out from under a percentage would leave the structure unpayable, so name the
  // dependents instead of letting the next payroll run discover it.
  const dependents = await prisma.salaryRule.findMany({
    where: { structureId: rule.structureId, percentageOfCode: rule.code },
    select: { code: true },
  });
  if (dependents.length > 0) {
    throw httpError(
      `rule ${rule.code} is the base for ${dependents.map((d) => d.code).join(", ")}; ` +
        "repoint or delete those first",
      409
    );
  }

  await prisma.salaryRule.delete({ where: { id: rule.id } });
  return { deleted: rule.id };
}

module.exports = {
  findStructures,
  findStructureById,
  createStructure,
  updateStructure,
  removeStructure,
  findRules,
  findRuleById,
  createRule,
  updateRule,
  removeRule,
  assertRulesConsistent,
  parseCode,
};
