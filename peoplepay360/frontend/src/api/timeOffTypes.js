import api from "./axios.js";
const view = (item) => ({ ...item, paid: item.affectsPayroll, approvalRequired: item.requiresAllocation, status: "Active" });
export async function getTimeOffTypes() { return (await api.get("/api/timeoff/types")).data.map(view); }
export async function getTimeOffTypeById(id) { return view((await api.get(`/api/timeoff/types/${id}`)).data); }
export async function createTimeOffType(data) { return view((await api.post("/api/timeoff/types", { name: data.name, unit: data.unit || "DAYS", requiresAllocation: data.approvalRequired ?? true, affectsPayroll: data.paid ?? false })).data); }
export async function updateTimeOffType(id, data) { return view((await api.put(`/api/timeoff/types/${id}`, { name: data.name, unit: data.unit || "DAYS", requiresAllocation: data.approvalRequired ?? true, affectsPayroll: data.paid ?? false })).data); }
