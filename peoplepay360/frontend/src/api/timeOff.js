import api from "./axios.js";
const day = (value) => value?.slice(0, 10) || "";
const title = (value) => value?.toLowerCase().replace(/^./, (letter) => letter.toUpperCase()) || "Pending";
const view = (item) => ({ ...item, employeeName: item.employee?.name || "", timeOffTypeName: item.timeOffType?.name || "", startDate: day(item.startDate), endDate: day(item.endDate), status: title(item.status) });
export function calculateRequestedDays(startDate, endDate) { if (!startDate || !endDate || endDate < startDate) return 0; return Math.floor((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86400000) + 1; }
export async function getTimeOffRequests() { return (await api.get("/api/timeoff/requests")).data.map(view); }
export async function getTimeOffRequestById(id) { const item = (await getTimeOffRequests()).find((request) => String(request.id) === String(id)); if (!item) throw new Error("Time off request not found"); return item; }
export async function getTimeOffRequestsByEmployee(employeeId) { return (await api.get("/api/timeoff/requests", { params: { employeeId } })).data.map(view); }
export async function createTimeOffRequest(data) { return view((await api.post("/api/timeoff/requests", { employeeId: Number(data.employeeId), timeOffTypeId: Number(data.timeOffTypeId), startDate: data.startDate, endDate: data.endDate })).data); }
export async function updateTimeOffRequest() { throw new Error("Submitted time off requests cannot be edited."); }
export async function approveTimeOffRequest(id) { return view((await api.put(`/api/timeoff/requests/${id}/approve`)).data); }
export async function refuseTimeOffRequest(id) { return view((await api.put(`/api/timeoff/requests/${id}/refuse`)).data); }
