import api from "./axios.js";
const time = (value) => value ? new Date(value).toISOString().slice(11, 16) : "";
const day = (value) => value?.slice(0, 10) || "";
const view = (item) => ({ ...item, date: day(item.date), checkIn: time(item.checkIn), checkOut: time(item.checkOut), status: item.status?.replace("NORMAL", "Present").replace("_", " ") });
export function calculateWorkedHours(checkIn, checkOut) { if (!checkIn || !checkOut) return null; const [a, b] = [checkIn, checkOut].map((value) => { const [h, m] = value.split(":").map(Number); return h * 60 + m; }); return b < a ? null : Math.round(((b - a) / 60) * 100) / 100; }
export function calculateAttendanceDifference(record) { const worked = calculateWorkedHours(record.checkIn, record.checkOut); return worked === null ? null : Math.round((worked - Number(record.expectedHours || 0)) * 100) / 100; }
export async function getAttendance() { return (await api.get("/api/attendance")).data.map(view); }
export async function getAttendanceById(id) { const item = (await getAttendance()).find((record) => String(record.id) === String(id)); if (!item) throw new Error("Attendance record not found"); return item; }
export async function getAttendanceByEmployee(employeeId) { return (await api.get("/api/attendance", { params: { employeeId } })).data.map(view); }
export async function createAttendance(data) { return view((await api.post("/api/attendance", { employeeId: Number(data.employeeId), date: data.date, checkIn: `${data.date}T${data.checkIn}:00.000Z`, checkOut: data.checkOut ? `${data.date}T${data.checkOut}:00.000Z` : null, status: data.status === "Present" ? "NORMAL" : String(data.status || "NORMAL").toUpperCase().replace(" ", "_") })).data); }
export async function updateAttendance(id, data) { return view((await api.put(`/api/attendance/${id}`, { checkOut: data.checkOut ? `${data.date}T${data.checkOut}:00.000Z` : null, status: data.status === "Present" ? "NORMAL" : String(data.status || "NORMAL").toUpperCase().replace(" ", "_") })).data); }
