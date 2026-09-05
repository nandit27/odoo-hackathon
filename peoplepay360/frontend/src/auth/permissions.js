export const ROLES = Object.freeze({
  EMPLOYEE: "EMPLOYEE",
  HR_MANAGER: "HR_MANAGER",
  HR_PAYROLL_USER: "HR_PAYROLL_USER",
  HR_PAYROLL_MANAGER: "HR_PAYROLL_MANAGER",
  ADMIN: "ADMIN",
});

const HR_ROLES = new Set([
  ROLES.HR_MANAGER,
  ROLES.HR_PAYROLL_USER,
  ROLES.HR_PAYROLL_MANAGER,
  ROLES.ADMIN,
]);

const PAYROLL_ROLES = new Set([
  ROLES.HR_PAYROLL_USER,
  ROLES.HR_PAYROLL_MANAGER,
  ROLES.ADMIN,
]);

export const isEmployee = (role) => role === ROLES.EMPLOYEE;
export const canAccessHR = (role) => HR_ROLES.has(role);
export const canManageEmployees = (role) => HR_ROLES.has(role);
export const canAccessPayroll = (role) => PAYROLL_ROLES.has(role);
export const canManagePayroll = (role) => role === ROLES.HR_PAYROLL_MANAGER || role === ROLES.ADMIN;

export function getHomeRoute(role) {
  return isEmployee(role) ? "/me" : "/";
}

const hrNavigation = [
  ["Dashboard", "/"],
  ["Employees", "/employees"],
  ["Contracts", "/contracts"],
  ["Working Schedules", "/working-schedules"],
  ["Attendance", "/attendance"],
  ["Time Off", "/timeoff"],
  ["Allocations", "/allocations"],
  ["Time Off Types", "/time-off-types"],
];

const employeeNavigation = [
  ["My HR", "/me"],
  ["My Profile", "/me/profile"],
  ["My Attendance", "/me/attendance"],
  ["My Time Off", "/me/timeoff"],
];

export function getNavigationForRole(role) {
  if (isEmployee(role)) return employeeNavigation;
  if (!canAccessHR(role)) return [];
  return canAccessPayroll(role) ? [...hrNavigation, ["Payroll", "/payroll"]] : hrNavigation;
}
