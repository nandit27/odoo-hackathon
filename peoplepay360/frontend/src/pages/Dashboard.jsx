import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployees } from "../api/employees.js";
import EmployeeAvatar from "../components/hr/EmployeeAvatar.jsx";
import StatusBadge from "../components/hr/StatusBadge.jsx";

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { getEmployees().then(setEmployees).catch(() => setError("Workforce information could not be loaded.")).finally(() => setLoading(false)); }, []);
  const summary = useMemo(() => [
    ["Total employees", employees.length],
    ["Active employees", employees.filter((item) => item.status === "Active").length],
    ["On leave", employees.filter((item) => item.status === "On Leave").length],
    ["Departments", new Set(employees.map((item) => item.department)).size],
  ], [employees]);
  const recent = employees.slice(0, 5);

  return <section>
    <div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">PeoplePay360</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Dashboard</h1><p className="mt-1 text-sm text-slate-600">Overview of your workforce and HR operations.</p></div>
    {error ? <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : <>
      <div className="grid border border-slate-200 bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-4">{summary.map(([label, value], index) => <div key={label} className={`px-5 py-4 ${index === 1 ? "border-t border-slate-200 sm:border-l sm:border-t-0" : ""} ${index === 2 ? "border-t border-slate-200 lg:border-l lg:border-t-0" : ""} ${index === 3 ? "border-t border-slate-200 sm:border-l lg:border-t-0" : ""}`}><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{loading ? "—" : value}</p></div>)}</div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><div><h2 className="text-sm font-semibold text-slate-950">Recent employees</h2><p className="mt-0.5 text-xs text-slate-500">Current workforce records</p></div><Link to="/employees" className="text-sm font-semibold text-blue-700 hover:underline">View all</Link></div>
          {loading ? <p className="px-5 py-10 text-center text-sm text-slate-500">Loading employees…</p> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Employee</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Position</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{recent.map((employee) => <tr key={employee.id} className="hover:bg-slate-50"><td className="min-w-56 px-5 py-3"><div className="flex items-center gap-3"><EmployeeAvatar employee={employee} size="sm" /><div><p className="font-semibold text-slate-900">{employee.fullName}</p><p className="text-xs text-slate-500">{employee.employeeId}</p></div></div></td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{employee.department}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{employee.position}</td><td className="whitespace-nowrap px-5 py-3"><StatusBadge status={employee.status} /></td></tr>)}</tbody></table></div>}
        </section>
        <div className="space-y-5">
          <section className="border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-3"><h2 className="text-sm font-semibold text-slate-950">Quick actions</h2></div><div className="divide-y divide-slate-100"><QuickLink to="/employees/new" label="Add employee" detail="Create a workforce record" /><QuickLink to="/employees" label="View employees" detail="Search and manage employees" /><QuickLink to="/attendance" label="Attendance" detail="Open attendance workspace" /><QuickLink to="/timeoff" label="Time off" detail="Open time off workspace" /></div></section>
          <section className="border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-3"><h2 className="text-sm font-semibold text-slate-950">Time off requests</h2></div><div className="px-5 py-6"><p className="text-sm font-medium text-slate-700">No request data available</p><p className="mt-1 text-sm leading-6 text-slate-500">Pending requests will appear here when the Time Off service is connected.</p></div></section>
        </div>
      </div>
    </>}
  </section>;
}

function QuickLink({ to, label, detail }) { return <Link to={to} className="block px-5 py-3 transition-colors hover:bg-slate-50"><span className="block text-sm font-semibold text-slate-800">{label}</span><span className="mt-0.5 block text-xs text-slate-500">{detail}</span></Link>; }
