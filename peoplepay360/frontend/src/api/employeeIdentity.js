export const cleanEmployeeId = (value) => String(value ?? "").trim();
export const normalizeEmployeeId = (value) => cleanEmployeeId(value).toLowerCase();
export const employeeIdsMatch = (left, right) => normalizeEmployeeId(left) === normalizeEmployeeId(right);
