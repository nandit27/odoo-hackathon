import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { calculateDailyHours, calculateWeeklyHours, getWorkingScheduleById } from "../api/workingSchedules.js";
import ScheduleStatusBadge from "../components/hr/ScheduleStatusBadge.jsx";

export default function WorkingScheduleDetails() {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { getWorkingScheduleById(id).then(setSchedule).catch((err) => setError(err.message)); }, [id]);
  if (error) return <Message text={error} />;
  if (!schedule) return <Message text="Loading schedule…" hideLink />;
  return <section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><Link to="/working-schedules" className="text-sm font-medium text-slate-600 hover:text-slate-950">← Back to working schedules</Link><Link to={`/working-schedules/${id}/edit`} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">Edit schedule</Link></div>
    <div className="overflow-hidden border border-slate-200 bg-white shadow-sm"><header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Working schedule</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{schedule.name}</h1><p className="mt-2 text-sm text-slate-600">{schedule.timeZone}</p></div><ScheduleStatusBadge status={schedule.status} /></header><div className="grid border-b border-slate-200 sm:grid-cols-3"><Summary label="Time zone" value={schedule.timeZone} /><Summary label="Status" value={schedule.status} border /><Summary label="Expected hours / week" value={`${calculateWeeklyHours(schedule.days)} hours`} border /></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] divide-y divide-slate-200 text-left text-sm md:min-w-0"><thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500"><tr>{["Day", "Status", "Start", "End", "Break", "Working hours"].map((heading) => <th key={heading} className="px-5 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{schedule.days.map((day) => <tr key={day.day} className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-slate-900">{day.day}</td><td className="px-5 py-3"><span className={day.working ? "font-medium text-emerald-700" : "text-slate-500"}>{day.working ? "Working" : "Off"}</span></td><td className="px-5 py-3 tabular-nums text-slate-600">{day.working ? day.startTime : "—"}</td><td className="px-5 py-3 tabular-nums text-slate-600">{day.working ? day.endTime : "—"}</td><td className="px-5 py-3 tabular-nums text-slate-600">{day.working ? `${day.breakMinutes} min` : "—"}</td><td className="px-5 py-3 font-semibold tabular-nums text-slate-800">{calculateDailyHours(day)} h</td></tr>)}</tbody></table></div>
    </div>
  </section>;
}
function Summary({ label, value, border }) { return <div className={`px-5 py-4 ${border ? "border-t border-slate-200 sm:border-l sm:border-t-0" : ""}`}><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-900">{value}</p></div>; }
function Message({ text, hideLink }) { return <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">{text}{!hideLink && <div className="mt-3"><Link to="/working-schedules" className="font-semibold text-blue-700 hover:underline">Back to working schedules</Link></div>}</div>; }
