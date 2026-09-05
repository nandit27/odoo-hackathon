import { cleanEmployeeId, employeeIdsMatch } from "./employeeIdentity.js";

const STORAGE_KEY = "peoplepay360.attendance";
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const seedAttendance = [
  {
    id: "ATT001",
    employeeId: "EMP001",
    employeeName: "Riya Patel",
    department: "IT",
    date: "2026-09-04",
    checkIn: "09:02",
    checkOut: "18:05",
    expectedHours: 8,
    workingSchedule: "Standard · Mon–Fri",
    status: "Present",
    notes: "",
  },
  {
    id: "ATT002",
    employeeId: "EMP002",
    employeeName: "Aarav Shah",
    department: "Human Resources",
    date: "2026-09-04",
    checkIn: "09:34",
    checkOut: "18:03",
    expectedHours: 8,
    workingSchedule: "Standard · Mon–Fri",
    status: "Late",
    notes: "Traffic delay reported.",
  },
  {
    id: "ATT003",
    employeeId: "EMP003",
    employeeName: "Meera Desai",
    department: "Finance",
    date: "2026-09-04",
    checkIn: "",
    checkOut: "",
    expectedHours: 8,
    workingSchedule: "Standard · Mon–Fri",
    status: "On Leave",
    notes: "Approved leave.",
  },
  {
    id: "ATT004",
    employeeId: "EMP004",
    employeeName: "Kabir Singh",
    department: "Operations",
    date: "2026-09-04",
    checkIn: "07:28",
    checkOut: "",
    expectedHours: 8,
    workingSchedule: "Early · Mon–Fri",
    status: "Missing Checkout",
    notes: "Checkout pending.",
  },
  {
    id: "ATT005",
    employeeId: "EMP005",
    employeeName: "Ishita Kapoor",
    department: "Marketing",
    date: "2026-09-04",
    checkIn: "",
    checkOut: "",
    expectedHours: 6.5,
    workingSchedule: "Flexible · Mon–Sat",
    status: "Absent",
    notes: "No attendance recorded.",
  },
  {
    id: "ATT006",
    employeeId: "EMP001",
    employeeName: "Riya Patel",
    department: "IT",
    date: "2026-09-03",
    checkIn: "08:55",
    checkOut: "18:20",
    expectedHours: 8,
    workingSchedule: "Standard · Mon–Fri",
    status: "Present",
    notes: "",
  },
];

const minutesFromTime = (value) => {
  const [hours, minutes] = String(value || "")
    .split(":")
    .map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes)
    ? hours * 60 + minutes
    : null;
};
export function calculateWorkedHours(checkIn, checkOut) {
  const start = minutesFromTime(checkIn);
  const end = minutesFromTime(checkOut);
  if (start === null || end === null || end < start) return null;
  return Math.round(((end - start) / 60) * 100) / 100;
}
export function calculateAttendanceDifference(record) {
  const worked = calculateWorkedHours(record.checkIn, record.checkOut);
  return worked === null
    ? null
    : Math.round((worked - Number(record.expectedHours || 0)) * 100) / 100;
}
const copyRecord = (record) => ({ ...record });

function readAttendance() {
  if (typeof localStorage === "undefined")
    return seedAttendance.map(copyRecord);
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedAttendance));
    return seedAttendance.map(copyRecord);
  }
  try {
    const records = JSON.parse(stored);
    if (!Array.isArray(records)) throw new Error("Invalid attendance store");
    return records.map(copyRecord);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedAttendance));
    return seedAttendance.map(copyRecord);
  }
}

function writeAttendance(records) {
  if (typeof localStorage === "undefined")
    throw new Error("Attendance storage is unavailable");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

const hasDuplicateEmployeeDate = (records, data, currentIndex = -1) =>
  records.some(
    (record, index) =>
      index !== currentIndex &&
      employeeIdsMatch(record.employeeId, data.employeeId) &&
      record.date === data.date,
  );

// Replace these function bodies with Axios requests when attendance endpoints exist.
export async function getAttendance() {
  await delay();
  return readAttendance();
}
export async function getAttendanceById(id) {
  await delay();
  const record = readAttendance().find((item) => item.id === id);
  if (!record) throw new Error("Attendance record not found");
  return copyRecord(record);
}
export async function getAttendanceByEmployee(employeeId) {
  await delay();
  return readAttendance()
    .filter((item) => employeeIdsMatch(item.employeeId, employeeId))
    .map(copyRecord);
}
export async function createAttendance(data) {
  await delay();
  const records = readAttendance();
  const employeeId = cleanEmployeeId(data.employeeId);
  if (!employeeId) throw new Error("Employee is required.");
  if (hasDuplicateEmployeeDate(records, { ...data, employeeId }))
    throw new Error("Attendance for this employee and date already exists.");
  const nextNumber =
    Math.max(
      0,
      ...records.map((item) => Number(item.id.replace("ATT", "")) || 0),
    ) + 1;
  const record = {
    ...data,
    id: `ATT${String(nextNumber).padStart(3, "0")}`,
    employeeId,
    expectedHours: Number(data.expectedHours || 0),
  };
  writeAttendance([record, ...records]);
  return copyRecord(record);
}
export async function updateAttendance(id, data) {
  await delay();
  const records = readAttendance();
  const index = records.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Attendance record not found");
  const employeeId = cleanEmployeeId(
    data.employeeId ?? records[index].employeeId,
  );
  if (!employeeId) throw new Error("Employee is required.");
  if (hasDuplicateEmployeeDate(records, { ...data, employeeId }, index))
    throw new Error("Attendance for this employee and date already exists.");
  records[index] = {
    ...records[index],
    ...data,
    id: records[index].id,
    employeeId,
    expectedHours: Number(data.expectedHours || 0),
  };
  writeAttendance(records);
  return copyRecord(records[index]);
}
