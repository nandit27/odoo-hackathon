import { Link } from "react-router-dom";
import { calculateDailyHours, calculateWeeklyHours } from "../../api/workingSchedules.js";
import ScheduleStatusBadge from "./ScheduleStatusBadge.jsx";

const abbreviations = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };
const hours = (value) => `${Number(value).toFixed(Number(value) % 1 ? 1 : 0)} h`;

export default function WorkingScheduleTable({ schedules }) {
  const headings = ["Schedule name", "Working days", "Hours / day", "Hours / week", "Time zone", "Status", "Actions"];
  return <div className="overflow-x-auto"><table className="w-full min-w-[900px] divide-y divide-slate-200 text-left text-sm lg:min-w-0"><thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500"><tr>{headings.map((heading) => <th key={heading} scope="col" className="whitespace-nowrap px-4 py-3 first:pl-5 last:pr-5">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 bg-white">{schedules.map((schedule) => {
    const workingDays = schedule.days.filter((day) => day.working);
    const average = workingDays.length ? calculateWeeklyHours(schedule.days) / workingDays.length : 0;
    return <tr key={schedule.id} className="transition-colors hover:bg-slate-50"><td className="px-4 py-3 pl-5"><Link to={`/working-schedules/${schedule.id}`} className="font-semibold text-slate-900 hover:underline">{schedule.name}</Link><p className="text-xs text-slate-500">{schedule.id}</p></td><td className="px-4 py-3 text-slate-600">{workingDays.map((day) => abbreviations[day.day]).join(", ") || "None"}</td><td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-700">{hours(average)}</td><td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums text-slate-800">{hours(calculateWeeklyHours(schedule.days))}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{schedule.timeZone}</td><td className="whitespace-nowrap px-4 py-3"><ScheduleStatusBadge status={schedule.status} /></td><td className="whitespace-nowrap px-4 py-3 pr-5"><div className="flex gap-3 font-semibold"><Link to={`/working-schedules/${schedule.id}`} className="text-slate-700 hover:underline">View</Link><Link to={`/working-schedules/${schedule.id}/edit`} className="text-blue-700 hover:underline">Edit</Link></div></td></tr>;
  })}</tbody></table></div>;
}
