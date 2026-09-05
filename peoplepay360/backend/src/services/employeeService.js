const { EmployeeStatus } = require("@prisma/client");
const prisma = require("../prisma/client");
const { httpError, parseId, parseDate } = require("../utils/validate");

const INCLUDE = {
  schedule: true,
  manager: { select: { id: true, name: true } },
};

const REQUIRED_FIELDS = ["name", "email", "department", "jobPosition"];

// Fields that are nullable or enum-backed, so they need coercing rather than a truthy check.
// ponytail: blocks self-management only; a longer manager cycle (A → B → A) still gets
// through. Walk the chain here if the org chart starts mattering.
function optionalFields(data, { selfId } = {}) {
  const patch = {};

  if ("managerId" in data) {
    if (data.managerId === null || data.managerId === "") {
      patch.managerId = null;
    } else {
      patch.managerId = parseId(data.managerId, "managerId");
      if (selfId && patch.managerId === selfId) {
        throw httpError("an employee cannot be their own manager");
      }
    }
  }

  if ("scheduleId" in data) {
    patch.scheduleId =
      data.scheduleId === null || data.scheduleId === ""
        ? null
        : parseId(data.scheduleId, "scheduleId");
  }

  if ("status" in data) {
    if (!Object.values(EmployeeStatus).includes(data.status)) {
      throw httpError(`status must be one of: ${Object.values(EmployeeStatus).join(", ")}`);
    }
    patch.status = data.status;
  }

  if ("dateJoined" in data) {
    patch.dateJoined = parseDate(data.dateJoined, "dateJoined");
  }

  return patch;
}

async function findAll() {
  return prisma.employee.findMany({ include: INCLUDE, orderBy: { id: "desc" }, take: 100 });
}

async function findById(idParam) {
  const id = parseId(idParam);
  const employee = await prisma.employee.findUnique({ where: { id }, include: INCLUDE });
  if (!employee) {
    throw httpError(`employee ${id} not found`, 404);
  }
  return employee;
}

async function create(data = {}) {
  const missing = REQUIRED_FIELDS.filter((field) => !data[field]);
  if (missing.length > 0) {
    throw httpError(`${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} required`);
  }

  return prisma.employee.create({
    data: {
      name: data.name,
      email: data.email,
      department: data.department,
      jobPosition: data.jobPosition,
      ...optionalFields(data),
    },
    include: INCLUDE,
  });
}

async function update(idParam, data = {}) {
  const id = parseId(idParam);

  const patch = {};
  for (const field of REQUIRED_FIELDS) {
    if (field in data) {
      if (!data[field]) {
        throw httpError(`${field} cannot be empty`);
      }
      patch[field] = data[field];
    }
  }
  Object.assign(patch, optionalFields(data, { selfId: id }));

  if (Object.keys(patch).length === 0) {
    throw httpError("no updatable fields provided");
  }

  // A missing row surfaces as Prisma P2025, which errorHandler maps to 404.
  return prisma.employee.update({ where: { id }, data: patch, include: INCLUDE });
}

module.exports = { findAll, findById, create, update };
