import { cleanEmployeeId, employeeIdsMatch } from "./employeeIdentity.js";

const STORAGE_KEY = "peoplepay360.timeOffRequests";
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const seedRequests = [
  {
    id: "TOR001",
    employeeId: "EMP001",
    employeeName: "Riya Patel",
    timeOffTypeId: "TOT001",
    timeOffTypeName: "Casual Leave",
    startDate: "2026-09-14",
    endDate: "2026-09-15",
    reason: "Family event.",
    availableBalance: 9,
    status: "Pending",
  },
  {
    id: "TOR002",
    employeeId: "EMP002",
    employeeName: "Aarav Shah",
    timeOffTypeId: "TOT001",
    timeOffTypeName: "Casual Leave",
    startDate: "2026-08-20",
    endDate: "2026-08-20",
    reason: "Personal appointment.",
    availableBalance: 8,
    status: "Approved",
  },
  {
    id: "TOR003",
    employeeId: "EMP003",
    employeeName: "Meera Desai",
    timeOffTypeId: "TOT002",
    timeOffTypeName: "Sick Leave",
    startDate: "2026-09-03",
    endDate: "2026-09-05",
    reason: "Medical recovery.",
    availableBalance: 8,
    status: "Approved",
  },
  {
    id: "TOR004",
    employeeId: "EMP004",
    employeeName: "Kabir Singh",
    timeOffTypeId: "TOT003",
    timeOffTypeName: "Paid Leave",
    startDate: "2026-10-12",
    endDate: "2026-10-16",
    reason: "Annual leave.",
    availableBalance: 13,
    status: "Draft",
  },
  {
    id: "TOR005",
    employeeId: "EMP001",
    employeeName: "Riya Patel",
    timeOffTypeId: "TOT002",
    timeOffTypeName: "Sick Leave",
    startDate: "2026-07-08",
    endDate: "2026-07-08",
    reason: "Unwell.",
    availableBalance: 9,
    status: "Refused",
  },
];
export function calculateRequestedDays(startDate, endDate) {
  if (!startDate || !endDate || endDate < startDate) return 0;
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  return Math.floor((end - start) / 86400000) + 1;
}
const copyRequest = (item) => ({ ...item });
const overlappingStatuses = new Set(["Pending", "Approved"]);

function readRequestStore() {
  if (typeof localStorage === "undefined") return seedRequests.map(copyRequest);
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedRequests));
    return seedRequests.map(copyRequest);
  }
  try {
    const requests = JSON.parse(stored);
    if (!Array.isArray(requests))
      throw new Error("Invalid Time Off request store");
    return requests.map(copyRequest);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedRequests));
    return seedRequests.map(copyRequest);
  }
}

function writeRequestStore(requests) {
  if (typeof localStorage === "undefined")
    throw new Error("Time Off storage is unavailable");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

const changeStatus = (id, status) => {
  const requests = readRequestStore();
  const index = requests.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Time off request not found");
  requests[index] = { ...requests[index], status };
  writeRequestStore(requests);
  return copyRequest(requests[index]);
};

const hasOverlappingRequest = (requests, data) =>
  requests.some(
    (request) =>
      employeeIdsMatch(request.employeeId, data.employeeId) &&
      overlappingStatuses.has(request.status) &&
      data.startDate <= request.endDate &&
      data.endDate >= request.startDate,
  );

// Replace these function bodies with API requests when backend endpoints exist.
export async function getTimeOffRequests() {
  await delay();
  return readRequestStore();
}
export async function getTimeOffRequestById(id) {
  await delay();
  const item = readRequestStore().find((request) => request.id === id);
  if (!item) throw new Error("Time off request not found");
  return copyRequest(item);
}
export async function getTimeOffRequestsByEmployee(employeeId) {
  await delay();
  return readRequestStore()
    .filter((item) => employeeIdsMatch(item.employeeId, employeeId))
    .map(copyRequest);
}
export async function createTimeOffRequest(data) {
  await delay();
  const requests = readRequestStore();
  const employeeId = cleanEmployeeId(data.employeeId);
  if (hasOverlappingRequest(requests, { ...data, employeeId }))
    throw new Error("A time off request already overlaps with these dates.");
  const nextNumber =
    Math.max(
      0,
      ...requests.map((item) => Number(item.id.replace("TOR", "")) || 0),
    ) + 1;
  const item = {
    ...data,
    id: `TOR${String(nextNumber).padStart(3, "0")}`,
    employeeId,
    status: "Pending",
  };
  writeRequestStore([...requests, item]);
  return copyRequest(item);
}
export async function updateTimeOffRequest(id, data) {
  await delay();
  const requests = readRequestStore();
  const index = requests.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Time off request not found");
  requests[index] = {
    ...requests[index],
    ...data,
    id,
    employeeId: cleanEmployeeId(data.employeeId ?? requests[index].employeeId),
    status: requests[index].status,
  };
  writeRequestStore(requests);
  return copyRequest(requests[index]);
}
export async function approveTimeOffRequest(id) {
  await delay();
  return changeStatus(id, "Approved");
}
export async function refuseTimeOffRequest(id) {
  await delay();
  return changeStatus(id, "Refused");
}
