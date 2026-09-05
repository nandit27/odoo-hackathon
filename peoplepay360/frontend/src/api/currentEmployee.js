import { getEmployeeById } from "./employees.js";

// The employee ID comes from AuthContext during the frontend demo. Backend auth
// will eventually provide the identity and enforce access to the returned record.
export async function getCurrentEmployee(employeeId) {
  if (!employeeId) throw new Error("No employee is associated with this session.");
  return getEmployeeById(employeeId);
}
