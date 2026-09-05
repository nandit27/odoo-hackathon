const { Role } = require("@prisma/client");
const { httpError, parseId } = require("./validate");

// The roles allowed to act across every employee. Anything not listed is scoped to itself, so a
// role added to the enum later is locked out of other people's records until it is added here.
const HR_ROLES = [Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER];

// Payroll configuration is a separate duty from people management: HR_PAYROLL_MANAGER writes it,
// HR_PAYROLL_USER only reads it. ADMIN is in both lists (the seeded admin must be able to set pay
// rules up); HR_MANAGER is in neither, so managing employees does not grant editing salary rules.
const PAYROLL_READ_ROLES = [Role.ADMIN, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER];
const PAYROLL_WRITE_ROLES = [Role.ADMIN, Role.HR_PAYROLL_MANAGER];

const isHrStaff = (actor) => Boolean(actor) && HR_ROLES.includes(actor.role);

function optionalEmployeeId(value) {
  return value === undefined || value === null || value === ""
    ? undefined
    : parseId(value, "employeeId");
}

// Resolves which employee a request may touch. HR staff get whatever they asked for (undefined
// meaning "all employees"); everyone else is pinned to their own linked employee record.
// Returns the employeeId to filter or write with, or undefined for "no filter".
function scopeToActor(actor, requestedEmployeeId, subject = "attendance records") {
  const requested = optionalEmployeeId(requestedEmployeeId);

  if (isHrStaff(actor)) {
    return requested;
  }
  if (!actor || !actor.employeeId) {
    throw httpError("your user account is not linked to an employee record", 403);
  }
  if (requested !== undefined && requested !== actor.employeeId) {
    throw httpError(`you can only access your own ${subject}`, 403);
  }
  return actor.employeeId;
}

// Like scopeToActor, but for writes that must name exactly one employee.
function requireEmployeeId(actor, requestedEmployeeId, subject) {
  const employeeId = scopeToActor(actor, requestedEmployeeId, subject);
  if (employeeId === undefined) {
    throw httpError("employeeId is required");
  }
  return employeeId;
}

module.exports = {
  HR_ROLES,
  PAYROLL_READ_ROLES,
  PAYROLL_WRITE_ROLES,
  isHrStaff,
  scopeToActor,
  requireEmployeeId,
};
