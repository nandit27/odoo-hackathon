const prisma = require("../prisma/client");
const { httpError, parseId } = require("../utils/validate");

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function toMinutes(value, label) {
  const match = TIME_RE.exec(String(value == null ? "" : value).trim());
  if (!match) {
    throw httpError(`${label} must be a HH:MM time between 00:00 and 23:59`);
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

// weeklyHours = Σ (endTime − startTime − breakMinutes) across every day in `pattern`.
// Always derived here; a client-supplied weeklyHours is ignored.
// ponytail: same-day shifts only. Overnight shifts need an explicit flag rather than
// inferring one from endTime < startTime, which would hide typos as 23-hour days.
function calcWeeklyHours(pattern) {
  if (!Array.isArray(pattern) || pattern.length === 0) {
    throw httpError(
      "pattern must be a non-empty array of { day, startTime, endTime, breakMinutes }"
    );
  }

  let minutes = 0;

  pattern.forEach((entry, index) => {
    const at = `pattern[${index}]`;
    if (!entry || typeof entry !== "object") {
      throw httpError(`${at} must be an object`);
    }
    if (!entry.day) {
      throw httpError(`${at}.day is required`);
    }

    const start = toMinutes(entry.startTime, `${at}.startTime`);
    const end = toMinutes(entry.endTime, `${at}.endTime`);
    if (end <= start) {
      throw httpError(`${at}.endTime must be after ${at}.startTime`);
    }

    const breakMinutes = entry.breakMinutes == null ? 0 : Number(entry.breakMinutes);
    if (!Number.isInteger(breakMinutes) || breakMinutes < 0) {
      throw httpError(`${at}.breakMinutes must be a non-negative integer`);
    }

    const worked = end - start - breakMinutes;
    if (worked <= 0) {
      throw httpError(`${at}.breakMinutes leaves no working time on ${entry.day}`);
    }

    minutes += worked;
  });

  return Math.round((minutes / 60) * 100) / 100;
}

async function findAll() {
  return prisma.workingSchedule.findMany({ orderBy: { id: "desc" }, take: 100 });
}

async function findById(idParam) {
  const id = parseId(idParam);
  const schedule = await prisma.workingSchedule.findUnique({ where: { id } });
  if (!schedule) {
    throw httpError(`schedule ${id} not found`, 404);
  }
  return schedule;
}

async function create(data = {}) {
  if (!data.name || !data.type) {
    throw httpError("name and type are required");
  }

  return prisma.workingSchedule.create({
    data: {
      name: data.name,
      type: data.type,
      pattern: data.pattern,
      weeklyHours: calcWeeklyHours(data.pattern),
    },
  });
}

async function update(idParam, data = {}) {
  const id = parseId(idParam);

  const patch = {};
  for (const field of ["name", "type"]) {
    if (field in data) {
      if (!data[field]) {
        throw httpError(`${field} cannot be empty`);
      }
      patch[field] = data[field];
    }
  }
  if ("pattern" in data) {
    patch.pattern = data.pattern;
    patch.weeklyHours = calcWeeklyHours(data.pattern);
  }

  if (Object.keys(patch).length === 0) {
    throw httpError("no updatable fields provided");
  }

  return prisma.workingSchedule.update({ where: { id }, data: patch });
}

module.exports = { findAll, findById, create, update, calcWeeklyHours };
