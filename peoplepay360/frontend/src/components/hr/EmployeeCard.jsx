import { Link } from "react-router-dom";
import EmployeeAvatar from "./EmployeeAvatar.jsx";
import StatusBadge from "./StatusBadge.jsx";

export default function EmployeeCard({ employee }) {
  return <article className="border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50/40"><div className="flex items-start gap-3"><EmployeeAvatar employee={employee} /><div className="min-w-0 flex-1">
    <div className="flex items-start justify-between gap-2"><div><h2 className="truncate font-semibold text-slate-900">{employee.fullName}</h2><p className="text-xs font-medium text-slate-500">{employee.employeeId}</p></div><StatusBadge status={employee.status} /></div>
    <p className="mt-3 text-sm font-medium text-slate-800">{employee.position}</p>
    <dl className="mt-2 space-y-1 text-sm text-slate-600"><div className="flex gap-2"><dt className="w-20 shrink-0 text-slate-500">Department</dt><dd className="truncate">{employee.department}</dd></div><div className="flex gap-2"><dt className="w-20 shrink-0 text-slate-500">Manager</dt><dd className="truncate">{employee.manager}</dd></div></dl>
    <div className="mt-4 flex gap-3 border-t border-slate-100 pt-3 text-sm font-medium"><Link to={`/employees/${employee.id}`} className="text-slate-700 hover:underline">View profile</Link><Link to={`/employees/${employee.id}/edit`} className="text-blue-700 hover:underline">Edit</Link></div>
  </div></div></article>;
}
