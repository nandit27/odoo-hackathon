import { useEffect, useState } from "react";
import { getCurrentEmployee } from "../api/currentEmployee.js";
import { useAuth } from "../auth/AuthContext.jsx";
import EmployeeAvatar from "../components/hr/EmployeeAvatar.jsx";
import StatusBadge from "../components/hr/StatusBadge.jsx";

export default function MyProfile() {
  const { employeeId } = useAuth();
  const [employee, setEmployee] = useState(null); const [error, setError] = useState(""); useEffect(() => { getCurrentEmployee(employeeId).then(setEmployee).catch(() => setError("Your profile could not be loaded.")); }, [employeeId]);
  if (error || !employee) return <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">{error || "Loading your profile…"}</div>;
  const items = [["Employee ID", employee.employeeId], ["Name", employee.fullName], ["Work email", employee.workEmail], ["Phone", employee.phone], ["Department", employee.department], ["Position", employee.position], ["Manager", employee.manager], ["Working schedule", employee.workingSchedule], ["Employment type", employee.employmentType], ["Joining date", new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${employee.joiningDate}T00:00:00`))]];
  return <section><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Employee self-service</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">My profile</h1><p className="mt-1 text-sm text-slate-600">Your employment and contact information.</p></div><div className="overflow-hidden border border-slate-200 bg-white shadow-sm"><header className="flex flex-wrap items-center gap-5 border-b border-slate-200 p-5 sm:p-6"><EmployeeAvatar employee={employee} size="lg" /><div className="flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-semibold text-slate-950">{employee.fullName}</h2><StatusBadge status={employee.status} /></div><p className="mt-2 text-sm text-slate-700">{employee.position} · {employee.department}</p></div></header><dl className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">{items.map(([label, value]) => <div key={label}><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-900">{value || "—"}</dd></div>)}</dl></div></section>;
}
