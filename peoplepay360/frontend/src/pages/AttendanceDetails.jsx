import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { calculateAttendanceDifference, calculateWorkedHours, getAttendanceById } from "../api/attendance.js";
import AttendanceStatusBadge from "../components/hr/AttendanceStatusBadge.jsx";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });
const hours = (value, signed) => value === null ? "—" : `${signed && value > 0 ? "+" : ""}${value} hours`;
export default function AttendanceDetails() {
  const { id } = useParams(); const [record, setRecord] = useState(null); const [error, setError] = useState("");
  useEffect(() => { getAttendanceById(id).then(setRecord).catch((err) => setError(err.message)); }, [id]);
  if (error) return <Message text={error} />; if (!record) return <Message text="Loading attendance…" hideLink />;
  const worked = calculateWorkedHours(record.checkIn, record.checkOut); const difference = calculateAttendanceDifference(record);
  return <section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><Link to="/attendance" className="text-sm font-medium text-slate-600 hover:text-slate-950">← Back to attendance</Link><div className="flex gap-2"><Link to={`/employees/${record.employeeId}`} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">View employee</Link><Link to={`/attendance/${id}/edit`} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">Edit attendance</Link></div></div>
    <div className="overflow-hidden border border-slate-200 bg-white shadow-sm"><header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Attendance record · {record.id}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{record.employeeName}</h1><p className="mt-2 text-sm text-slate-600">{dateFormatter.format(new Date(`${record.date}T00:00:00`))}</p></div><AttendanceStatusBadge status={record.status} /></header><div className="divide-y divide-slate-200 px-5 sm:px-6"><Info title="Employee and schedule" items={[["Employee", record.employeeName], ["Department", record.department], ["Working schedule", record.workingSchedule], ["Expected hours", hours(record.expectedHours)]]} /><Info title="Actual attendance" items={[["Check in", record.checkIn || "—"], ["Check out", record.checkOut || "—"], ["Worked hours", hours(worked)], ["Difference", hours(difference, true)], ["Status", record.status]]} /><Info title="Notes / reason" items={[["Notes", record.notes || "—"]]} /></div></div>
  </section>;
}
function Info({ title, items }) { return <section className="py-6"><h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h2><dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(([label, value]) => <div key={label}><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd></div>)}</dl></section>; }
function Message({ text, hideLink }) { return <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">{text}{!hideLink && <div className="mt-3"><Link to="/attendance" className="font-semibold text-blue-700 hover:underline">Back to attendance</Link></div>}</div>; }
