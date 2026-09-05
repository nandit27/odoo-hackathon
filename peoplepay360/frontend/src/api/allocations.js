import api from "./axios.js";
const day = (value) => value?.slice(0, 10) || "";
const view = (item) => ({ ...item, employeeName: item.employee?.name || "", timeOffTypeName: item.timeOffType?.name || "", validUntil: day(item.validTo), validFrom: day(item.validFrom), allocatedDays: Number(item.allocated), usedDays: Number(item.taken), status: "Active" });
export function calculateRemainingDays(allocation) { return Math.round((Number(allocation.allocatedDays || 0) - Number(allocation.usedDays || 0)) * 100) / 100; }
export async function getAllocations() { return (await api.get("/api/timeoff/allocations")).data.map(view); }
export async function getAllocationById(id) { const item = (await getAllocations()).find((allocation) => String(allocation.id) === String(id)); if (!item) throw new Error("Allocation not found"); return item; }
export async function getAllocationsByEmployee(employeeId) { return (await api.get("/api/timeoff/allocations", { params: { employeeId } })).data.map(view); }
export async function createAllocation(data) { return view((await api.post("/api/timeoff/allocations", { employeeId: Number(data.employeeId), timeOffTypeId: Number(data.timeOffTypeId), allocated: Number(data.allocatedDays), validFrom: data.validFrom, validTo: data.validUntil || data.validTo })).data); }
export async function updateAllocation() { throw new Error("Allocations are immutable; create a new allocation instead."); }
