const requestStore = [
  { id: "TOR001", employeeId: "EMP001", employeeName: "Riya Patel", timeOffTypeId: "TOT001", timeOffTypeName: "Casual Leave", startDate: "2026-09-14", endDate: "2026-09-15", reason: "Family event.", availableBalance: 9, status: "Pending" },
  { id: "TOR002", employeeId: "EMP002", employeeName: "Aarav Shah", timeOffTypeId: "TOT001", timeOffTypeName: "Casual Leave", startDate: "2026-08-20", endDate: "2026-08-20", reason: "Personal appointment.", availableBalance: 8, status: "Approved" },
  { id: "TOR003", employeeId: "EMP003", employeeName: "Meera Desai", timeOffTypeId: "TOT002", timeOffTypeName: "Sick Leave", startDate: "2026-09-03", endDate: "2026-09-05", reason: "Medical recovery.", availableBalance: 8, status: "Approved" },
  { id: "TOR004", employeeId: "EMP004", employeeName: "Kabir Singh", timeOffTypeId: "TOT003", timeOffTypeName: "Paid Leave", startDate: "2026-10-12", endDate: "2026-10-16", reason: "Annual leave.", availableBalance: 13, status: "Draft" },
  { id: "TOR005", employeeId: "EMP001", employeeName: "Riya Patel", timeOffTypeId: "TOT002", timeOffTypeName: "Sick Leave", startDate: "2026-07-08", endDate: "2026-07-08", reason: "Unwell.", availableBalance: 9, status: "Refused" },
];
export function calculateRequestedDays(startDate, endDate) {
  if (!startDate || !endDate || endDate < startDate) return 0;
  const start = Date.parse(`${startDate}T00:00:00Z`); const end = Date.parse(`${endDate}T00:00:00Z`);
  return Math.floor((end - start) / 86400000) + 1;
}
const copyRequest = (item) => ({ ...item });
const changeStatus = (id, status) => { const index = requestStore.findIndex((item) => item.id === id); if (index < 0) throw new Error("Time off request not found"); requestStore[index] = { ...requestStore[index], status }; return copyRequest(requestStore[index]); };

// Replace these function bodies with API requests when backend endpoints exist.
export async function getTimeOffRequests() { return requestStore.map(copyRequest); }
export async function getTimeOffRequestById(id) { const item = requestStore.find((request) => request.id === id); if (!item) throw new Error("Time off request not found"); return copyRequest(item); }
export async function getTimeOffRequestsByEmployee(employeeId) { return requestStore.filter((item) => item.employeeId === employeeId).map(copyRequest); }
export async function createTimeOffRequest(data) { const nextNumber = Math.max(0, ...requestStore.map((item) => Number(item.id.replace("TOR", "")) || 0)) + 1; const item = { ...data, id: `TOR${String(nextNumber).padStart(3, "0")}`, status: "Pending" }; requestStore.unshift(item); return copyRequest(item); }
export async function updateTimeOffRequest(id, data) { const index = requestStore.findIndex((item) => item.id === id); if (index < 0) throw new Error("Time off request not found"); requestStore[index] = { ...requestStore[index], ...data, id, status: requestStore[index].status }; return copyRequest(requestStore[index]); }
export async function approveTimeOffRequest(id) { return changeStatus(id, "Approved"); }
export async function refuseTimeOffRequest(id) { return changeStatus(id, "Refused"); }
