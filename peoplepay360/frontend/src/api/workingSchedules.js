export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const STORAGE_KEY = "peoplepay360.workingSchedules";
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const standardWeek = WEEKDAYS.map((day, index) => ({
  day,
  working: index < 5,
  startTime: index < 5 ? "09:00" : "",
  endTime: index < 5 ? "18:00" : "",
  breakMinutes: index < 5 ? 60 : 0,
}));
const earlyWeek = WEEKDAYS.map((day, index) => ({
  day,
  working: index < 5,
  startTime: index < 5 ? "07:30" : "",
  endTime: index < 5 ? "16:00" : "",
  breakMinutes: index < 5 ? 30 : 0,
}));
const flexibleWeek = WEEKDAYS.map((day, index) => ({
  day,
  working: index < 6,
  startTime: index < 6 ? "10:00" : "",
  endTime: index < 6 ? "17:00" : "",
  breakMinutes: index < 6 ? 30 : 0,
}));

const seedSchedules = [
  {
    id: "SCH001",
    name: "Standard · Mon–Fri",
    timeZone: "Asia/Kolkata",
    status: "Active",
    days: standardWeek,
  },
  {
    id: "SCH002",
    name: "Early · Mon–Fri",
    timeZone: "Asia/Kolkata",
    status: "Active",
    days: earlyWeek,
  },
  {
    id: "SCH003",
    name: "Flexible · Mon–Sat",
    timeZone: "Asia/Kolkata",
    status: "Inactive",
    days: flexibleWeek,
  },
];

const minutesFromTime = (value) => {
  const [hours, minutes] = String(value || "")
    .split(":")
    .map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes)
    ? hours * 60 + minutes
    : 0;
};
export function calculateDailyHours(day) {
  if (!day.working || !day.startTime || !day.endTime) return 0;
  const duration =
    minutesFromTime(day.endTime) -
    minutesFromTime(day.startTime) -
    Number(day.breakMinutes || 0);
  return Math.max(0, Math.round((duration / 60) * 100) / 100);
}
export function calculateWeeklyHours(days) {
  return (
    Math.round(
      days.reduce((total, day) => total + calculateDailyHours(day), 0) * 100,
    ) / 100
  );
}
const copySchedule = (schedule) => ({
  ...schedule,
  days: schedule.days.map((day) => ({ ...day })),
});

function readSchedules() {
  if (typeof localStorage === "undefined")
    return seedSchedules.map(copySchedule);
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedSchedules));
    return seedSchedules.map(copySchedule);
  }
  try {
    const schedules = JSON.parse(stored);
    if (!Array.isArray(schedules))
      throw new Error("Invalid working schedule store");
    return schedules.map(copySchedule);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedSchedules));
    return seedSchedules.map(copySchedule);
  }
}

function writeSchedules(schedules) {
  if (typeof localStorage === "undefined")
    throw new Error("Working schedule storage is unavailable");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
}

const normalizeDays = (days) =>
  days.map((day) => ({
    ...day,
    breakMinutes: Number(day.breakMinutes || 0),
  }));

// Replace these function bodies with Axios requests when schedule endpoints exist.
export async function getWorkingSchedules() {
  await delay();
  return readSchedules();
}
export async function getWorkingScheduleById(id) {
  await delay();
  const schedule = readSchedules().find((item) => item.id === id);
  if (!schedule) throw new Error("Working schedule not found");
  return copySchedule(schedule);
}
export async function createWorkingSchedule(data) {
  await delay();
  const schedules = readSchedules();
  const nextNumber =
    Math.max(
      0,
      ...schedules.map((item) => Number(item.id.replace("SCH", "")) || 0),
    ) + 1;
  const schedule = {
    ...data,
    id: `SCH${String(nextNumber).padStart(3, "0")}`,
    days: normalizeDays(data.days),
  };
  writeSchedules([schedule, ...schedules]);
  return copySchedule(schedule);
}
export async function updateWorkingSchedule(id, data) {
  await delay();
  const schedules = readSchedules();
  const index = schedules.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Working schedule not found");
  schedules[index] = {
    ...schedules[index],
    ...data,
    id: schedules[index].id,
    days: normalizeDays(data.days),
  };
  writeSchedules(schedules);
  return copySchedule(schedules[index]);
}
