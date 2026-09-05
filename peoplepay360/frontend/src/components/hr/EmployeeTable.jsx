import { Link } from "react-router-dom";
import EmployeeAvatar from "./EmployeeAvatar.jsx";
import StatusBadge from "./StatusBadge.jsx";

export default function EmployeeTable({ employees }) {
  const headings = ["Employee ID", "Employee", "Department", "Position", "Manager", "Working schedule", "Status", "Actions"];
  return <div className="overflow-x-auto"><table className="w-full min-w-[1080px] divide-y divide-slate-200 text-left text-sm xl:min-w-0">
    <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500"><tr>{headings.map((heading) => <th key={heading} scope="col" className="whitespace-nowrap px-4 py-3 first:pl-5 last:pr-5">{heading}</th>)}</tr></thead>
    <tbody className="divide-y divide-slate-100 bg-white">{employees.map((employee) => <tr key={employee.id} className="transition-colors hover:bg-slate-50">
      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700 first:pl-5">{employee.employeeId}</td>
      <td className="min-w-60 px-4 py-3"><div className="flex items-center gap-3"><EmployeeAvatar employee={employee} size="sm" /><div className="min-w-0"><div className="font-semibold text-slate-900">{employee.fullName}</div><div className="truncate text-xs text-slate-500">{employee.workEmail}</div></div></div></td>
      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{employee.department}</td><td className="px-4 py-3 text-slate-600">{employee.position}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{employee.manager}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{employee.workingSchedule}</td>
      <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={employee.status} /></td>
      <td className="whitespace-nowrap px-4 py-3 pr-5"><div className="flex gap-3 text-sm font-semibold"><Link className="text-slate-700 hover:text-slate-950 hover:underline" to={`/employees/${employee.id}`}>View</Link><Link className="text-blue-700 hover:text-blue-900 hover:underline" to={`/employees/${employee.id}/edit`}>Edit</Link></div></td>
    </tr>)}</tbody>
  </table></div>;
}
