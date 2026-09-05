import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getEmployeeById } from "../api/employees.js";
import EmployeeAvatar from "../components/hr/EmployeeAvatar.jsx";
import StatusBadge from "../components/hr/StatusBadge.jsx";

export default function EmployeeDetails() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { getEmployeeById(id).then(setEmployee).catch((err) => setError(err.message)); }, [id]);
  if (error) return <Message text={error} />;
  if (!employee) return <Message text="Loading employee…" hideLink />;
  const buttons = [["Contracts", "contracts", employee.counts.contracts], ["Attendance", "attendance", employee.counts.attendance], ["Time Off", "timeoff", employee.counts.timeOff], ["Allocations", "allocations", employee.counts.allocations]];
  return <section>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><Link to="/employees" className="text-sm font-medium text-slate-600 hover:text-slate-950">← Back to employees</Link><Link to={`/employees/${id}/edit`} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">Edit employee</Link></div>
    <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center gap-5 border-b border-slate-200 p-5 sm:p-6"><EmployeeAvatar employee={employee} size="lg" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-semibold tracking-tight text-slate-950">{employee.fullName}</h1><StatusBadge status={employee.status} /></div><p className="mt-1 text-sm font-medium text-slate-500">{employee.employeeId}</p><p className="mt-2 text-sm text-slate-700">{employee.position} · {employee.department}</p></div></header>
      <div className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">{buttons.map(([label, path, count]) => <Link key={label} to={`/employees/${id}/${path}`} className="border-b border-r border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50 sm:border-b-0 last:border-r-0"><span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span><span className="mt-1 block text-lg font-semibold text-slate-900">{count ?? 0}</span></Link>)}</div>
      <div className="divide-y divide-slate-200 px-5 sm:px-6"><Info title="Basic information" items={[["Employee ID", employee.employeeId], ["Name", employee.fullName], ["Joining date", formatDate(employee.joiningDate)], ["Employment type", employee.employmentType], ["Status", employee.status]]} /><Info title="Work information" items={[["Department", employee.department], ["Position", employee.position], ["Manager", employee.manager], ["Working schedule", employee.workingSchedule]]} /><Info title="Contact information" items={[["Work email", employee.workEmail], ["Phone", employee.phone], ["Address", employee.address]]} /></div>
    </div>
  </section>;
}
function Info({ title, items }) { return <section className="py-6"><h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2><dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">{items.map(([label, value]) => <div key={label}><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 text-sm text-slate-900">{value || "—"}</dd></div>)}</dl></section>; }
function Message({ text, hideLink }) { return <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">{text}{!hideLink && <div className="mt-3"><Link to="/employees" className="font-medium text-blue-700 hover:underline">Back to employees</Link></div>}</div>; }
function formatDate(value) { return value ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "—"; }
