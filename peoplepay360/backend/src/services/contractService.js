const { ContractStatus } = require("@prisma/client");
const prisma = require("../prisma/client");
const { httpError, parseId, parseDate } = require("../utils/validate");

function parseWage(value) {
  if (value === null || value === undefined || value === "") {
    throw httpError("wage is required");
  }
  const wage = Number(value);
  if (!Number.isFinite(wage) || wage < 0) {
    throw httpError("wage must be a non-negative number");
  }
  return wage;
}

function parseStatus(value) {
  if (value === undefined) {
    return ContractStatus.ACTIVE;
  }
  if (!Object.values(ContractStatus).includes(value)) {
    throw httpError(`status must be one of: ${Object.values(ContractStatus).join(", ")}`);
  }
  return value;
}

function isoDay(date) {
  return date ? date.toISOString().slice(0, 10) : "open-ended";
}

// Two ACTIVE contracts collide when
//   existing.startDate <= candidate.endDate AND (existing.endDate IS NULL OR existing.endDate >= candidate.startDate)
// When the candidate is open-ended the first clause is dropped rather than compared against
// NULL: an open-ended contract runs forever, so it collides with every ACTIVE contract that
// has not already ended before it starts.
function overlapWhere({ employeeId, startDate, endDate, excludeId }) {
  const conditions = [{ OR: [{ endDate: null }, { endDate: { gte: startDate } }] }];
  if (endDate) {
    conditions.push({ startDate: { lte: endDate } });
  }

  return {
    employeeId,
    status: ContractStatus.ACTIVE,
    ...(excludeId ? { id: { not: excludeId } } : {}),
    AND: conditions,
  };
}

// ponytail: check-then-write, so two simultaneous requests can both pass. If concurrent
// contract writes become real, add a Postgres EXCLUDE constraint on
// (employeeId, daterange(startDate, endDate)) WHERE status = 'ACTIVE'.
async function assertNoOverlap(candidate) {
  const clash = await prisma.contract.findFirst({
    where: overlapWhere(candidate),
    orderBy: { startDate: "asc" },
  });
  if (!clash) {
    return;
  }

  throw httpError(
    `employee ${candidate.employeeId} already has an ACTIVE contract (#${clash.id}, ` +
      `${isoDay(clash.startDate)} to ${isoDay(clash.endDate)}) overlapping the requested range ` +
      `${isoDay(candidate.startDate)} to ${isoDay(candidate.endDate)}. ` +
      "An employee cannot have two concurrent ACTIVE contracts."
  );
}

async function findAll({ employeeId } = {}) {
  const where = {};
  if (employeeId !== undefined && employeeId !== "") {
    where.employeeId = parseId(employeeId, "employeeId");
  }

  return prisma.contract.findMany({
    where,
    orderBy: [{ employeeId: "asc" }, { startDate: "desc" }],
    take: 100,
  });
}

async function findById(idParam) {
  const id = parseId(idParam);
  const contract = await prisma.contract.findUnique({ where: { id } });
  if (!contract) {
    throw httpError(`contract ${id} not found`, 404);
  }
  return contract;
}

async function create(data = {}) {
  if (!data.department || !data.position) {
    throw httpError("department and position are required");
  }

  const employeeId = parseId(data.employeeId, "employeeId");
  const salaryStructureId = parseId(data.salaryStructureId, "salaryStructureId");
  const startDate = parseDate(data.startDate, "startDate");
  const endDate = data.endDate ? parseDate(data.endDate, "endDate") : null;
  const wage = parseWage(data.wage);
  const status = parseStatus(data.status);

  if (endDate && endDate < startDate) {
    throw httpError("endDate must be on or after startDate");
  }
  if (status === ContractStatus.ACTIVE) {
    await assertNoOverlap({ employeeId, startDate, endDate });
  }

  return prisma.contract.create({
    data: {
      employeeId,
      salaryStructureId,
      startDate,
      endDate,
      wage,
      status,
      department: data.department,
      position: data.position,
    },
  });
}

async function update(idParam, data = {}) {
  const id = parseId(idParam);
  const existing = await prisma.contract.findUnique({ where: { id } });
  if (!existing) {
    throw httpError(`contract ${id} not found`, 404);
  }

  const patch = {};
  if ("employeeId" in data) patch.employeeId = parseId(data.employeeId, "employeeId");
  if ("salaryStructureId" in data) {
    patch.salaryStructureId = parseId(data.salaryStructureId, "salaryStructureId");
  }
  if ("startDate" in data) patch.startDate = parseDate(data.startDate, "startDate");
  if ("endDate" in data) {
    patch.endDate = data.endDate ? parseDate(data.endDate, "endDate") : null;
  }
  if ("wage" in data) patch.wage = parseWage(data.wage);
  if ("status" in data) patch.status = parseStatus(data.status);
  for (const field of ["department", "position"]) {
    if (field in data) {
      if (!data[field]) {
        throw httpError(`${field} cannot be empty`);
      }
      patch[field] = data[field];
    }
  }

  if (Object.keys(patch).length === 0) {
    throw httpError("no updatable fields provided");
  }

  // Validate the post-update row, not just the patch: flipping status to ACTIVE or shifting
  // dates can create an overlap even when the other fields are untouched.
  const merged = { ...existing, ...patch };
  if (merged.endDate && merged.endDate < merged.startDate) {
    throw httpError("endDate must be on or after startDate");
  }
  if (merged.status === ContractStatus.ACTIVE) {
    await assertNoOverlap({
      employeeId: merged.employeeId,
      startDate: merged.startDate,
      endDate: merged.endDate,
      excludeId: id,
    });
  }

  return prisma.contract.update({ where: { id }, data: patch });
}

module.exports = { findAll, findById, create, update, overlapWhere };

