import { ROLES } from "./permissions.js";

// Temporary local demo credentials. Replace this module with backend authentication.
export const demoUsers = Object.freeze([
  { name: "Riya Patel", email: "riya.patel@peoplepay360.com", password: "demo123", role: ROLES.EMPLOYEE, employeeId: "EMP001" },
  { name: "Neha Joshi", email: "hr.manager@peoplepay360.com", password: "demo123", role: ROLES.HR_MANAGER },
  { name: "Arjun Mehta", email: "payroll.user@peoplepay360.com", password: "demo123", role: ROLES.HR_PAYROLL_USER },
  { name: "Priya Shah", email: "payroll.manager@peoplepay360.com", password: "demo123", role: ROLES.HR_PAYROLL_MANAGER },
  { name: "System Admin", email: "admin@peoplepay360.com", password: "admin123", role: ROLES.ADMIN },
]);

export function authenticateDemoUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  return demoUsers.find((user) => user.email.toLowerCase() === normalizedEmail && user.password === password) || null;
}

export function getDemoUserByEmail(email) {
  return demoUsers.find((user) => user.email.toLowerCase() === String(email).toLowerCase()) || null;
}

export function toSessionUser(user) {
  if (!user) return null;
  const { password: _password, ...sessionUser } = user;
  return sessionUser;
}
