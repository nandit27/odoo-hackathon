export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const standardWeek = WEEKDAYS.map((day, index) => ({ day, working: index < 5, startTime: index < 5 ? "09:00" : "", endTime: index < 5 ? "18:00" : "", breakMinutes: index < 5 ? 60 : 0 }));
const earlyWeek = WEEKDAYS.map((day, index) => ({ day, working: index < 5, startTime: index < 5 ? "07:30" : "", endTime: index < 5 ? "16:00" : "", breakMinutes: index < 5 ? 30 : 0 }));
const flexibleWeek = WEEKDAYS.map((day, index) => ({ day, working: index < 6, startTime: index < 6 ? "10:00" : "", endTime: index < 6 ? "17:00" : "", breakMinutes: index < 6 ? 30 : 0 }));

const scheduleStore = [
  { id: "SCH001", name: "Standard · Mon–Fri", timeZone: "Asia/Kolkata", status: "Active", days: standardWeek },
  { id: "SCH002", name: "Early · Mon–Fri", timeZone: "Asia/Kolkata", status: "Active", days: earlyWeek },
  { id: "SCH003", name: "Flexible · Mon–Sat", timeZone: "Asia/Kolkata", status: "Inactive", days: flexibleWeek },
];

const minutesFromTime = (value) => { const [hours, minutes] = String(value || "").split(":").map(Number); return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : 0; };
export function calculateDailyHours(day) {
  if (!day.working || !day.startTime || !day.endTime) return 0;
  const duration = minutesFromTime(day.endTime) - minutesFromTime(day.startTime) - Number(day.breakMinutes || 0);
  return Math.max(0, Math.round((duration / 60) * 100) / 100);
}
export function calculateWeeklyHours(days) { return Math.round(days.reduce((total, day) => total + calculateDailyHours(day), 0) * 100) / 100; }
const copySchedule = (schedule) => ({ ...schedule, days: schedule.days.map((day) => ({ ...day })) });

// Replace these function bodies with Axios requests when schedule endpoints exist.
export async function getWorkingSchedules() { return scheduleStore.map(copySchedule); }
export async function getWorkingScheduleById(id) {
  const schedule = scheduleStore.find((item) => item.id === id);
  if (!schedule) throw new Error("Working schedule not found");
  return copySchedule(schedule);
}
export async function createWorkingSchedule(data) {
  const nextNumber = Math.max(0, ...scheduleStore.map((item) => Number(item.id.replace("SCH", "")) || 0)) + 1;
  const schedule = { ...data, id: `SCH${String(nextNumber).padStart(3, "0")}`, days: data.days.map((day) => ({ ...day, breakMinutes: Number(day.breakMinutes || 0) })) };
  scheduleStore.unshift(schedule);
  return copySchedule(schedule);
}
export async function updateWorkingSchedule(id, data) {
  const index = scheduleStore.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Working schedule not found");
  scheduleStore[index] = { ...scheduleStore[index], ...data, id, days: data.days.map((day) => ({ ...day, breakMinutes: Number(day.breakMinutes || 0) })) };
  return copySchedule(scheduleStore[index]);
}
