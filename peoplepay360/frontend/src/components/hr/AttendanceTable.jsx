import { Link } from "react-router-dom";
import { calculateAttendanceDifference, calculateWorkedHours } from "../../api/attendance.js";
import AttendanceStatusBadge from "./AttendanceStatusBadge.jsx";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const formatDate = (value) => dateFormatter.format(new Date(`${value}T00:00:00`));
const formatHours = (value) => value === null ? "—" : `${value.toFixed(value % 1 ? 2 : 0)} h`;

export default function AttendanceTable({ records }) {
  const headings = ["Date", "Employee", "Check in", "Check out", "Worked hours", "Expected hours", "Difference", "Status", "Actions"];
  return <div className="overflow-x-auto"><table className="w-full min-w-[1120px] divide-y divide-slate-200 text-left text-sm xl:min-w-0"><thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500"><tr>{headings.map((heading) => <th key={heading} scope="col" className="whitespace-nowrap px-4 py-3 first:pl-5 last:pr-5">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 bg-white">{records.map((record) => {
    const worked = calculateWorkedHours(record.checkIn, record.checkOut); const difference = calculateAttendanceDifference(record);
    return <tr key={record.id} className="transition-colors hover:bg-slate-50"><td className="whitespace-nowrap px-4 py-3 pl-5 font-medium text-slate-700">{formatDate(record.date)}</td><td className="min-w-44 px-4 py-3"><Link to={`/employees/${record.employeeId}`} className="font-semibold text-slate-900 hover:underline">{record.employeeName}</Link><p className="text-xs text-slate-500">{record.department}</p></td><td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">{record.checkIn || "—"}</td><td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">{record.checkOut || "—"}</td><td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums text-slate-700">{formatHours(worked)}</td><td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">{formatHours(record.expectedHours)}</td><td className={`whitespace-nowrap px-4 py-3 font-semibold tabular-nums ${difference === null ? "text-slate-400" : difference < 0 ? "text-red-700" : "text-emerald-700"}`}>{difference === null ? "—" : `${difference > 0 ? "+" : ""}${formatHours(difference)}`}</td><td className="whitespace-nowrap px-4 py-3"><AttendanceStatusBadge status={record.status} /></td><td className="whitespace-nowrap px-4 py-3 pr-5"><div className="flex gap-3 font-semibold"><Link to={`/attendance/${record.id}`} className="text-slate-700 hover:underline">View</Link><Link to={`/attendance/${record.id}/edit`} className="text-blue-700 hover:underline">Edit</Link></div></td></tr>;
  })}</tbody></table></div>;
}
