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
  { label: "Employees", to: "/employees", items: [["Employees", "/employees"], ["New Employee", "/employees/new"]] },
  { label: "Contracts", to: "/contracts", items: [["Contracts", "/contracts"], ["New Contract", "/contracts/new"], ["Working Schedules", "/working-schedules"]] },
  { label: "Attendance", to: "/attendance" },
  { label: "Time Off", to: "/timeoff", items: [["Requests", "/timeoff"], ["Allocations", "/allocations"], ["Time Off Types", "/time-off-types"]] },
];

const employeeNavigation = [
  { label: "My HR", to: "/me" },
  { label: "My Profile", to: "/me/profile" },
  { label: "My Attendance", to: "/me/attendance" },
  { label: "My Time Off", to: "/me/timeoff" },
];

export function getNavigationForRole(role) {
  if (isEmployee(role)) return employeeNavigation;
  if (!canAccessHR(role)) return [];
  return canAccessPayroll(role) ? [...hrNavigation, { label: "Payroll", to: "/payroll" }] : hrNavigation;
}
