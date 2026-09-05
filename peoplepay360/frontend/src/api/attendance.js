const attendanceStore = [
  { id: "ATT001", employeeId: "EMP001", employeeName: "Riya Patel", department: "IT", date: "2026-09-04", checkIn: "09:02", checkOut: "18:05", expectedHours: 8, workingSchedule: "Standard · Mon–Fri", status: "Present", notes: "" },
  { id: "ATT002", employeeId: "EMP002", employeeName: "Aarav Shah", department: "Human Resources", date: "2026-09-04", checkIn: "09:34", checkOut: "18:03", expectedHours: 8, workingSchedule: "Standard · Mon–Fri", status: "Late", notes: "Traffic delay reported." },
  { id: "ATT003", employeeId: "EMP003", employeeName: "Meera Desai", department: "Finance", date: "2026-09-04", checkIn: "", checkOut: "", expectedHours: 8, workingSchedule: "Standard · Mon–Fri", status: "On Leave", notes: "Approved leave." },
  { id: "ATT004", employeeId: "EMP004", employeeName: "Kabir Singh", department: "Operations", date: "2026-09-04", checkIn: "07:28", checkOut: "", expectedHours: 8, workingSchedule: "Early · Mon–Fri", status: "Missing Checkout", notes: "Checkout pending." },
  { id: "ATT005", employeeId: "EMP005", employeeName: "Ishita Kapoor", department: "Marketing", date: "2026-09-04", checkIn: "", checkOut: "", expectedHours: 6.5, workingSchedule: "Flexible · Mon–Sat", status: "Absent", notes: "No attendance recorded." },
  { id: "ATT006", employeeId: "EMP001", employeeName: "Riya Patel", department: "IT", date: "2026-09-03", checkIn: "08:55", checkOut: "18:20", expectedHours: 8, workingSchedule: "Standard · Mon–Fri", status: "Present", notes: "" },
];

const minutesFromTime = (value) => { const [hours, minutes] = String(value || "").split(":").map(Number); return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null; };
export function calculateWorkedHours(checkIn, checkOut) {
  const start = minutesFromTime(checkIn); const end = minutesFromTime(checkOut);
  if (start === null || end === null || end < start) return null;
  return Math.round(((end - start) / 60) * 100) / 100;
}
export function calculateAttendanceDifference(record) {
  const worked = calculateWorkedHours(record.checkIn, record.checkOut);
  return worked === null ? null : Math.round((worked - Number(record.expectedHours || 0)) * 100) / 100;
}
const copyRecord = (record) => ({ ...record });

// Replace these function bodies with Axios requests when attendance endpoints exist.
export async function getAttendance() { return attendanceStore.map(copyRecord); }
export async function getAttendanceById(id) {
  const record = attendanceStore.find((item) => item.id === id);
  if (!record) throw new Error("Attendance record not found");
  return copyRecord(record);
}
export async function getAttendanceByEmployee(employeeId) { return attendanceStore.filter((item) => item.employeeId === employeeId).map(copyRecord); }
export async function createAttendance(data) {
  const nextNumber = Math.max(0, ...attendanceStore.map((item) => Number(item.id.replace("ATT", "")) || 0)) + 1;
  const record = { ...data, id: `ATT${String(nextNumber).padStart(3, "0")}`, expectedHours: Number(data.expectedHours || 0) };
  attendanceStore.unshift(record); return copyRecord(record);
}
export async function updateAttendance(id, data) {
  const index = attendanceStore.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Attendance record not found");
  attendanceStore[index] = { ...attendanceStore[index], ...data, id, expectedHours: Number(data.expectedHours || 0) };
  return copyRecord(attendanceStore[index]);
}
