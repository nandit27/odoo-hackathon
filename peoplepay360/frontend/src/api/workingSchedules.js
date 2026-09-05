import api from "./axios.js";
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const calculateDailyHours = (entry) => {
  const minutes = (value) => Number(value?.slice(0, 2)) * 60 + Number(value?.slice(3));
  return Math.max(0, (minutes(entry.endTime) - minutes(entry.startTime) - Number(entry.breakMinutes || 0)) / 60);
};
export const calculateWeeklyHours = (pattern = []) => Math.round(pattern.reduce((total, entry) => total + calculateDailyHours(entry), 0) * 100) / 100;
const view = (item) => ({ ...item, weeklyHours: Number(item.weeklyHours), pattern: item.pattern || [], days: (item.pattern || []).map((day) => ({ ...day, working: true })), timeZone: "UTC", status: "Active" });
const payload = (item) => ({ name: item.name, type: item.type, pattern: (item.days || item.pattern || []).filter((day) => day.working !== false).map(({ day, startTime, endTime, breakMinutes }) => ({ day, startTime, endTime, breakMinutes: Number(breakMinutes || 0) })) });
export async function getWorkingSchedules() { return (await api.get("/api/schedules")).data.map(view); }
export async function getWorkingScheduleById(id) { return view((await api.get(`/api/schedules/${id}`)).data); }
export async function createWorkingSchedule(data) { return view((await api.post("/api/schedules", payload(data))).data); }
export async function updateWorkingSchedule(id, data) { return view((await api.put(`/api/schedules/${id}`, payload(data))).data); }
