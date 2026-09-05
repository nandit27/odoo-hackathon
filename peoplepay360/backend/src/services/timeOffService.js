const { TimeOffUnit, TimeOffStatus } = require("@prisma/client");
const prisma = require("../prisma/client");
const { scopeToActor, requireEmployeeId } = require("../utils/scope");
const { httpError, parseId, parseDate } = require("../utils/validate");

const MS_PER_HOUR = 3600000;
const MS_PER_DAY = 86400000;
const MAX_AMOUNT = 9999.99; // Decimal(6,2)

const round2 = (value) => Math.round(value * 100) / 100;
const isoDay = (date) => date.toISOString().slice(0, 10);

// Midnight UTC of the day a timestamp falls on, to compare against @db.Date columns.
const utcDay = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

function enumValue(enumObject, value, label) {
  const allowed = Object.values(enumObject);
  if (!allowed.includes(value)) {
    throw httpError(`${label} must be one of: ${allowed.join(", ")}`);
  }
  return value;
}

function parseBoolean(value, label) {
  if (typeof value !== "boolean") {
    throw httpError(`${label} must be true or false`);
  }
  return value;
}

function parseAmount(value, label) {
  if (value === null || value === undefined || value === "") {
    throw httpError(`${label} is required`);
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw httpError(`${label} must be a positive number`);
  }
  if (amount > MAX_AMOUNT) {
    throw httpError(`${label} must not exceed ${MAX_AMOUNT}`);
  }
  return round2(amount);
}

function parseName(value) {
  if (typeof value !== "string" || value.trim() === "") {
    throw httpError("name is required");
  }
  return value.trim();
}

// DAYS counts calendar days inclusively, so a single-day request is 1 and not 0. HOURS measures
// elapsed time, which is why a request carries timestamps rather than bare dates. The unit also
// sets the granularity of the check: for DAYS only the day matters, so a date picker that sends
// 09:00 as the start and midnight as the end still books one valid day.
function computeDuration(unit, startDate, endDate) {
  if (unit === TimeOffUnit.HOURS) {
    const hours = (endDate.getTime() - startDate.getTime()) / MS_PER_HOUR;
    if (hours <= 0) {
      throw httpError("endDate must be after startDate for an HOURS type");
    }
    return round2(hours);
  }
  const days = (utcDay(endDate).getTime() - utcDay(startDate).getTime()) / MS_PER_DAY + 1;
  if (days < 1) {
    throw httpError("endDate must be on or after startDate");
  }
  return days;
}

// The highest `taken` that still leaves room for `duration`. Decimal maths, not floats: a balance
// is money-like and 0.1 + 0.2 must not creep. Returned so the caller can reuse it as a write guard.
function balanceCeiling(allocation, duration) {
  const ceiling = allocation.allocated.minus(duration);
  if (allocation.taken.greaterThan(ceiling)) {
    throw httpError("Insufficient balance");
  }
  return ceiling;
}

// remaining is derived on read, never a column — a stored copy is one more thing to drift.
const withRemaining = (allocation) => ({
  ...allocation,
  remaining: allocation.allocated.minus(allocation.taken),
});

const REQUEST_INCLUDE = {
  timeOffType: true,
  employee: { select: { id: true, name: true } },
  approvedBy: { select: { id: true, name: true } },
};

/* ---------------------------------------------------------------- types --- */

async function findTypes() {
  return prisma.timeOffType.findMany({ orderBy: { name: "asc" } });
}

async function findTypeById(idParam) {
  const id = parseId(idParam);
  const type = await prisma.timeOffType.findUnique({ where: { id } });
  if (!type) {
    throw httpError(`time off type ${id} not found`, 404);
  }
  return type;
}

async function createType(data = {}) {
  return prisma.timeOffType.create({
    data: {
      name: parseName(data.name),
      unit: data.unit === undefined ? TimeOffUnit.DAYS : enumValue(TimeOffUnit, data.unit, "unit"),
      requiresAllocation:
        data.requiresAllocation === undefined
          ? true
          : parseBoolean(data.requiresAllocation, "requiresAllocation"),
      affectsPayroll:
        data.affectsPayroll === undefined
          ? false
          : parseBoolean(data.affectsPayroll, "affectsPayroll"),
    },
  });
}

async function updateType(idParam, data = {}) {
  const id = parseId(idParam);
  const patch = {};
  if ("name" in data) patch.name = parseName(data.name);
  if ("unit" in data) patch.unit = enumValue(TimeOffUnit, data.unit, "unit");
  if ("requiresAllocation" in data) {
    patch.requiresAllocation = parseBoolean(data.requiresAllocation, "requiresAllocation");
  }
  if ("affectsPayroll" in data) {
    patch.affectsPayroll = parseBoolean(data.affectsPayroll, "affectsPayroll");
  }
  if (Object.keys(patch).length === 0) {
    throw httpError("no updatable fields provided");
  }
  // Changing `unit` does not restate durations already computed under the old unit.
  return prisma.timeOffType.update({ where: { id }, data: patch });
}

async function removeType(idParam) {
  const id = parseId(idParam);
  const [allocations, requests] = await Promise.all([
    prisma.timeOffAllocation.count({ where: { timeOffTypeId: id } }),
    prisma.timeOffRequest.count({ where: { timeOffTypeId: id } }),
  ]);
  if (allocations + requests > 0) {
    throw httpError(
      `time off type ${id} is in use by ${allocations} allocation(s) and ${requests} request(s)`,
      409
    );
  }
  await prisma.timeOffType.delete({ where: { id } });
  return { deleted: id };
}

/* ---------------------------------------------------------- allocations --- */

async function findAllocations({ employeeId } = {}, actor) {
  const scopedEmployeeId = scopeToActor(actor, employeeId, "time off allocations");
  const allocations = await prisma.timeOffAllocation.findMany({
    where: scopedEmployeeId === undefined ? {} : { employeeId: scopedEmployeeId },
    include: { timeOffType: true, employee: { select: { id: true, name: true } } },
    orderBy: [{ validTo: "asc" }, { id: "asc" }],
    take: 200,
  });
  return allocations.map(withRemaining);
}

async function createAllocation(data = {}) {
  const validFrom = parseDate(data.validFrom, "validFrom");
  const validTo = parseDate(data.validTo, "validTo");
  if (validTo < validFrom) {
    throw httpError("validTo must be on or after validFrom");
  }

  const allocation = await prisma.timeOffAllocation.create({
    data: {
      employeeId: parseId(data.employeeId, "employeeId"),
      timeOffTypeId: parseId(data.timeOffTypeId, "timeOffTypeId"),
      allocated: parseAmount(data.allocated, "allocated"),
      // `taken` is only ever moved by an approval, never set by a caller.
      validFrom,
      validTo,
    },
    include: { timeOffType: true },
  });
  return withRemaining(allocation);
}

// The allocation whose validity window contains the first day of the request, soonest expiry
// first so a balance is spent before it lapses.
// ponytail: one allocation per request. A request straddling two windows is rejected rather than
// split across both — splitting needs a policy decision on which balance to drain first.
function activeAllocation(tx, { employeeId, timeOffTypeId, startDate }) {
  const day = utcDay(startDate);
  return tx.timeOffAllocation.findFirst({
    where: {
      employeeId,
      timeOffTypeId,
      validFrom: { lte: day },
      validTo: { gte: day },
    },
    orderBy: { validTo: "asc" },
  });
}

/* ------------------------------------------------------------- requests --- */

async function findRequests({ employeeId, status } = {}, actor) {
  const scopedEmployeeId = scopeToActor(actor, employeeId, "time off requests");
  const where = {};
  if (scopedEmployeeId !== undefined) where.employeeId = scopedEmployeeId;
  if (status) where.status = enumValue(TimeOffStatus, status, "status");

  return prisma.timeOffRequest.findMany({
    where,
    include: REQUEST_INCLUDE,
    orderBy: [{ startDate: "desc" }, { id: "desc" }],
    take: 200,
  });
}

async function createRequest(data = {}, actor) {
  const employeeId = requireEmployeeId(actor, data.employeeId, "time off requests");
  const timeOffTypeId = parseId(data.timeOffTypeId, "timeOffTypeId");
  const startDate = parseDate(data.startDate, "startDate");
  const endDate = parseDate(data.endDate, "endDate");

  const type = await prisma.timeOffType.findUnique({ where: { id: timeOffTypeId } });
  if (!type) {
    throw httpError(`time off type ${timeOffTypeId} not found`, 404);
  }

  return prisma.timeOffRequest.create({
    data: {
      employeeId,
      timeOffTypeId,
      startDate,
      endDate,
      // Derived from the type's unit; a client-supplied duration or status is ignored, so nobody
      // can post themselves an approved request or a duration that undercuts their balance.
      duration: computeDuration(type.unit, startDate, endDate),
    },
    include: REQUEST_INCLUDE,
  });
}

// Only a PENDING request can be decided, so an approval cannot be replayed to drain a balance
// twice and a refusal cannot silently undo an approved deduction.
function assertPending(request, id) {
  if (!request) {
    throw httpError(`time off request ${id} not found`, 404);
  }
  if (request.status !== TimeOffStatus.PENDING) {
    throw httpError(`time off request ${id} is already ${request.status.toLowerCase()}`);
  }
}

async function approve(idParam, actor) {
  const id = parseId(idParam);

  return prisma.$transaction(async (tx) => {
    const request = await tx.timeOffRequest.findUnique({
      where: { id },
      include: { timeOffType: true },
    });
    assertPending(request, id);

    if (request.timeOffType.requiresAllocation) {
      const allocation = await activeAllocation(tx, request);
      if (!allocation) {
        throw httpError(
          `no ${request.timeOffType.name} allocation covers ${isoDay(request.startDate)}`
        );
      }

      // Decimal maths, not floats: a balance is money-like and 0.1 + 0.2 must not creep.
      const ceiling = balanceCeiling(allocation, request.duration);
      // The `taken` guard makes the read and the write one statement: two approvals racing on the
      // same allocation cannot both pass the balance check, the loser's count comes back 0.
      const bumped = await tx.timeOffAllocation.updateMany({
        where: { id: allocation.id, taken: { lte: ceiling } },
        data: { taken: { increment: request.duration } },
      });
      if (bumped.count === 0) {
        throw httpError("Insufficient balance");
      }
    }

    const decided = await tx.timeOffRequest.updateMany({
      where: { id, status: TimeOffStatus.PENDING },
      data: { status: TimeOffStatus.APPROVED, approvedById: actor.userId },
    });
    if (decided.count === 0) {
      throw httpError("request was decided by someone else, reload and retry", 409);
    }

    return tx.timeOffRequest.findUnique({ where: { id }, include: REQUEST_INCLUDE });
  });
}

async function refuse(idParam, actor) {
  const id = parseId(idParam);
  const request = await prisma.timeOffRequest.findUnique({ where: { id } });
  assertPending(request, id);

  // approvedById doubles as "who decided this", so a refusal is attributable too. No allocation
  // is touched: only a PENDING request can be refused, so nothing was ever deducted.
  const decided = await prisma.timeOffRequest.updateMany({
    where: { id, status: TimeOffStatus.PENDING },
    data: { status: TimeOffStatus.REFUSED, approvedById: actor.userId },
  });
  if (decided.count === 0) {
    throw httpError("request was decided by someone else, reload and retry", 409);
  }
  return prisma.timeOffRequest.findUnique({ where: { id }, include: REQUEST_INCLUDE });
}

module.exports = {
  findTypes,
  findTypeById,
  createType,
  updateType,
  removeType,
  findAllocations,
  createAllocation,
  findRequests,
  createRequest,
  approve,
  refuse,
  computeDuration,
  balanceCeiling,
  withRemaining,
};
