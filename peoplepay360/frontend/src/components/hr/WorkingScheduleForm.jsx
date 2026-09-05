import { useState } from "react";
import { calculateDailyHours, calculateWeeklyHours } from "../../api/workingSchedules.js";

const timeZones = ["Asia/Kolkata", "Asia/Dubai", "Europe/London", "America/New_York", "UTC"];
const inputClass = "h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100 disabled:text-slate-400";
const minutesFromTime = (value) => { const [hours, minutes] = String(value || "").split(":").map(Number); return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : 0; };

export default function WorkingScheduleForm({ initialValues, onSubmit, onCancel, submitting, serverError }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  function change(event) { setValues((current) => ({ ...current, [event.target.name]: event.target.value })); setErrors((current) => ({ ...current, [event.target.name]: "" })); }
  function updateDay(index, field, value) {
    setValues((current) => ({ ...current, days: current.days.map((day, dayIndex) => dayIndex === index ? { ...day, [field]: value } : day) }));
    setErrors((current) => ({ ...current, [`day-${index}`]: "" }));
  }
  function toggleDay(index) {
    const day = values.days[index];
    updateDay(index, "working", !day.working);
    if (!day.working && (!day.startTime || !day.endTime)) setValues((current) => ({ ...current, days: current.days.map((item, dayIndex) => dayIndex === index ? { ...item, working: true, startTime: "09:00", endTime: "18:00", breakMinutes: 60 } : item) }));
  }
  function submit(event) {
    event.preventDefault(); const next = {};
    if (!values.name.trim()) next.name = "Schedule name is required.";
    values.days.forEach((day, index) => {
      if (!day.working) return;
      if (!day.startTime || !day.endTime) next[`day-${index}`] = "Start and end time are required.";
      else {
        const duration = minutesFromTime(day.endTime) - minutesFromTime(day.startTime);
        if (duration <= 0) next[`day-${index}`] = "End time must be after start time.";
        else if (Number(day.breakMinutes || 0) > duration) next[`day-${index}`] = "Break cannot exceed the shift duration.";
      }
      if (Number(day.breakMinutes) < 0) next[`day-${index}`] = "Break cannot be negative.";
    });
    setErrors(next); if (!Object.keys(next).length) onSubmit(values);
  }
  return <form onSubmit={submit} noValidate className="overflow-hidden border border-slate-200 bg-white shadow-sm">
    {serverError && <div role="alert" className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">{serverError}</div>}
    <div className="grid gap-5 border-b border-slate-200 p-5 sm:grid-cols-3 sm:p-6"><label className="text-sm font-medium text-slate-700">Schedule name <Required /><input name="name" value={values.name} onChange={change} className={`mt-1 ${inputClass}`} aria-invalid={Boolean(errors.name)} /><Error text={errors.name} /></label><label className="text-sm font-medium text-slate-700">Time zone <Required /><select name="timeZone" value={values.timeZone} onChange={change} className={`mt-1 ${inputClass}`}>{timeZones.map((zone) => <option key={zone}>{zone}</option>)}</select></label><label className="text-sm font-medium text-slate-700">Status <Required /><select name="status" value={values.status} onChange={change} className={`mt-1 ${inputClass}`}><option>Active</option><option>Inactive</option></select></label></div>
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3"><div><h2 className="text-sm font-semibold text-slate-950">Weekly expected hours</h2><p className="text-xs text-slate-500">Configure expected shifts; attendance is recorded separately.</p></div><p className="text-sm font-semibold tabular-nums text-slate-900">Total: {calculateWeeklyHours(values.days)} hours / week</p></div>
    <div className="divide-y divide-slate-200"><div className="hidden grid-cols-[1.1fr_1fr_1fr_1fr_1fr_.8fr] gap-3 bg-slate-50 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 md:grid"><span>Day</span><span>Status</span><span>Start</span><span>End</span><span>Break</span><span>Hours</span></div>{values.days.map((day, index) => <div key={day.day} className="grid gap-3 px-5 py-4 md:grid-cols-[1.1fr_1fr_1fr_1fr_1fr_.8fr] md:items-center md:py-3">
      <p className="text-sm font-semibold text-slate-900">{day.day}</p><button type="button" onClick={() => toggleDay(index)} className={`h-9 rounded-md border px-3 text-left text-sm font-medium md:text-center ${day.working ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-300 bg-white text-slate-500"}`}>{day.working ? "Working" : "Off"}</button>
      <label className="text-xs font-medium text-slate-500 md:text-sm"><span className="md:sr-only">Start time</span><input aria-label={`${day.day} start time`} type="time" disabled={!day.working} value={day.startTime} onChange={(event) => updateDay(index, "startTime", event.target.value)} className={inputClass} /></label><label className="text-xs font-medium text-slate-500 md:text-sm"><span className="md:sr-only">End time</span><input aria-label={`${day.day} end time`} type="time" disabled={!day.working} value={day.endTime} onChange={(event) => updateDay(index, "endTime", event.target.value)} className={inputClass} /></label><label className="text-xs font-medium text-slate-500 md:text-sm"><span className="md:sr-only">Break (minutes)</span><div className="relative"><input aria-label={`${day.day} break minutes`} type="number" min="0" disabled={!day.working} value={day.breakMinutes} onChange={(event) => updateDay(index, "breakMinutes", event.target.value)} className={`${inputClass} pr-9`} /><span className="absolute inset-y-0 right-2 flex items-center text-xs text-slate-400">min</span></div></label><p className="text-sm font-semibold tabular-nums text-slate-800"><span className="mr-2 text-xs font-medium text-slate-500 md:hidden">Working hours</span>{calculateDailyHours(day)} h</p>{errors[`day-${index}`] && <div className="text-xs text-red-600 md:col-span-6">{errors[`day-${index}`]}</div>}
    </div>)}</div>
    <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6"><button type="button" onClick={onCancel} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" disabled={submitting} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{submitting ? "Saving…" : "Save schedule"}</button></div>
  </form>;
}
function Required() { return <span className="text-red-600">*</span>; }
function Error({ text }) { return text ? <span className="mt-1 block text-xs text-red-600">{text}</span> : null; }
