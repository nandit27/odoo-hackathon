const { AttendanceStatus } = require("@prisma/client");
const prisma = require("../prisma/client");
const { scopeToActor } = require("../utils/scope");
const { httpError, parseId, parseDate } = require("../utils/validate");

const MS_PER_HOUR = 3600000;
const STATUSES = Object.values(AttendanceStatus);

// workedHours = checkOut - checkIn in hours, to 2 decimals. Null while the day is still open.
function computeWorkedHours(checkIn, checkOut) {
  if (!checkOut) return null;
  const ms = checkOut.getTime() - checkIn.getTime();
  if (ms <= 0) {
    throw httpError("checkOut must be after checkIn");
  }
  return Math.round((ms / MS_PER_HOUR) * 100) / 100;
}

function parseStatus(value) {
  if (!STATUSES.includes(value)) {
    throw httpError(`status must be one of: ${STATUSES.join(", ")}`);
  }
  return value;
}

async function findAll({ employeeId, from, to } = {}, actor) {
  const scopedEmployeeId = scopeToActor(actor, employeeId);
  const where = {};
  if (scopedEmployeeId !== undefined) {
    where.employeeId = scopedEmployeeId;
  }

  if (from || to) {
    where.date = {};
    if (from) where.date.gte = parseDate(from, "from");
    if (to) where.date.lte = parseDate(to, "to");
    if (where.date.gte && where.date.lte && where.date.gte > where.date.lte) {
      throw httpError("from must be on or before to");
    }
  }

  return prisma.attendance.findMany({
    where,
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: 200,
  });
}

async function create(data = {}) {
  const employeeId = parseId(data.employeeId, "employeeId");
  const checkIn = parseDate(data.checkIn, "checkIn");
  const checkOut = data.checkOut ? parseDate(data.checkOut, "checkOut") : null;
  // date is a day bucket for the shift, so default it to the day checkIn falls on.
  // ponytail: bucketed in UTC. Add a tz if a late-evening local shift must not roll to the next day.
  const date = data.date
    ? parseDate(data.date, "date")
    : new Date(`${checkIn.toISOString().slice(0, 10)}T00:00:00.000Z`);

  return prisma.attendance.create({
    data: {
      employeeId,
      date,
      checkIn,
      checkOut,
      workedHours: computeWorkedHours(checkIn, checkOut),
      status: data.status === undefined ? AttendanceStatus.NORMAL : parseStatus(data.status),
    },
  });
}

// Only checkOut and status are editable; correcting checkIn or date is not part of this flow.
async function update(idParam, data = {}) {
  const id = parseId(idParam);
  const hasCheckOut = "checkOut" in data;
  const hasStatus = "status" in data;
  if (!hasCheckOut && !hasStatus) {
    throw httpError("provide checkOut, status, or both");
  }

  const existing = await prisma.attendance.findUnique({ where: { id } });
  if (!existing) {
    throw httpError(`attendance ${id} not found`, 404);
  }

  const checkOut = hasCheckOut
    ? data.checkOut && parseDate(data.checkOut, "checkOut")
    : existing.checkOut;

  return prisma.attendance.update({
    where: { id },
    data: {
      checkOut: checkOut || null,
      workedHours: computeWorkedHours(existing.checkIn, checkOut),
      // An explicit status wins; otherwise any edit after creation is a manual correction.
      status: hasStatus ? parseStatus(data.status) : AttendanceStatus.MANUAL_EDIT,
    },
  });
}

module.exports = { findAll, create, update, computeWorkedHours, scopeToActor };
