import { cleanEmployeeId, employeeIdsMatch } from "./employeeIdentity.js";

const STORAGE_KEY = "peoplepay360.allocations";
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const seedAllocations = [
  {
    id: "ALC001",
    employeeId: "EMP001",
    employeeName: "Riya Patel",
    timeOffTypeId: "TOT001",
    timeOffTypeName: "Casual Leave",
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    allocatedDays: 12,
    usedDays: 3,
    status: "Active",
    notes: "Annual casual leave entitlement.",
  },
  {
    id: "ALC002",
    employeeId: "EMP001",
    employeeName: "Riya Patel",
    timeOffTypeId: "TOT002",
    timeOffTypeName: "Sick Leave",
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    allocatedDays: 10,
    usedDays: 1,
    status: "Active",
    notes: "",
  },
  {
    id: "ALC003",
    employeeId: "EMP002",
    employeeName: "Aarav Shah",
    timeOffTypeId: "TOT001",
    timeOffTypeName: "Casual Leave",
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    allocatedDays: 12,
    usedDays: 4,
    status: "Active",
    notes: "",
  },
  {
    id: "ALC004",
    employeeId: "EMP002",
    employeeName: "Aarav Shah",
    timeOffTypeId: "TOT003",
    timeOffTypeName: "Paid Leave",
    validFrom: "2025-01-01",
    validUntil: "2025-12-31",
    allocatedDays: 15,
    usedDays: 15,
    status: "Expired",
    notes: "Previous annual allocation.",
  },
  {
    id: "ALC005",
    employeeId: "EMP003",
    employeeName: "Meera Desai",
    timeOffTypeId: "TOT002",
    timeOffTypeName: "Sick Leave",
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    allocatedDays: 10,
    usedDays: 2,
    status: "Active",
    notes: "",
  },
  {
    id: "ALC006",
    employeeId: "EMP004",
    employeeName: "Kabir Singh",
    timeOffTypeId: "TOT003",
    timeOffTypeName: "Paid Leave",
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    allocatedDays: 18,
    usedDays: 5,
    status: "Active",
    notes: "Operations leadership entitlement.",
  },
  {
    id: "ALC007",
    employeeId: "EMP005",
    employeeName: "Ishita Kapoor",
    timeOffTypeId: "TOT004",
    timeOffTypeName: "Unpaid Leave",
    validFrom: "2026-06-01",
    validUntil: "2027-05-31",
    allocatedDays: 8,
    usedDays: 0,
    status: "Draft",
    notes: "Pending HR approval.",
  },
];

export function calculateRemainingDays(allocation) {
  return (
    Math.round(
      (Number(allocation.allocatedDays || 0) -
        Number(allocation.usedDays || 0)) *
        100,
    ) / 100
  );
}
const copyAllocation = (item) => ({ ...item });

function readAllocations() {
  if (typeof localStorage === "undefined")
    return seedAllocations.map(copyAllocation);
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedAllocations));
    return seedAllocations.map(copyAllocation);
  }
  try {
    const allocations = JSON.parse(stored);
    if (!Array.isArray(allocations))
      throw new Error("Invalid allocation store");
    return allocations.map(copyAllocation);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedAllocations));
    return seedAllocations.map(copyAllocation);
  }
}

function writeAllocations(allocations) {
  if (typeof localStorage === "undefined")
    throw new Error("Allocation storage is unavailable");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allocations));
}

// Replace these function bodies with Axios requests when allocation endpoints exist.
export async function getAllocations() {
  await delay();
  return readAllocations();
}
export async function getAllocationById(id) {
  await delay();
  const item = readAllocations().find((allocation) => allocation.id === id);
  if (!item) throw new Error("Allocation not found");
  return copyAllocation(item);
}
export async function getAllocationsByEmployee(employeeId) {
  await delay();
  return readAllocations()
    .filter((item) => employeeIdsMatch(item.employeeId, employeeId))
    .map(copyAllocation);
}
export async function createAllocation(data) {
  await delay();
  const allocations = readAllocations();
  const nextNumber =
    Math.max(
      0,
      ...allocations.map((item) => Number(item.id.replace("ALC", "")) || 0),
    ) + 1;
  const item = {
    ...data,
    id: `ALC${String(nextNumber).padStart(3, "0")}`,
    employeeId: cleanEmployeeId(data.employeeId),
    allocatedDays: Number(data.allocatedDays),
    usedDays: 0,
  };
  writeAllocations([item, ...allocations]);
  return copyAllocation(item);
}
export async function updateAllocation(id, data) {
  await delay();
  const allocations = readAllocations();
  const index = allocations.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Allocation not found");
  allocations[index] = {
    ...allocations[index],
    ...data,
    id: allocations[index].id,
    employeeId: cleanEmployeeId(
      data.employeeId ?? allocations[index].employeeId,
    ),
    allocatedDays: Number(data.allocatedDays),
    usedDays: Number(allocations[index].usedDays || 0),
  };
  writeAllocations(allocations);
  return copyAllocation(allocations[index]);
}
