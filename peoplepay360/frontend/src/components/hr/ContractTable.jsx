import { Link } from "react-router-dom";
import ContractStatusBadge from "./ContractStatusBadge.jsx";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const moneyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const formatDate = (value) => value ? dateFormatter.format(new Date(`${value}T00:00:00`)) : "Open-ended";

export default function ContractTable({ contracts }) {
  const headings = ["Contract ID", "Employee", "Job position", "Employment type", "Start date", "End date", "Working schedule", "Base wage", "Status", "Actions"];
  return <div className="overflow-x-auto"><table className="w-full min-w-[1240px] divide-y divide-slate-200 text-left text-sm 2xl:min-w-0">
    <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500"><tr>{headings.map((heading) => <th key={heading} scope="col" className="whitespace-nowrap px-4 py-3 first:pl-5 last:pr-5">{heading}</th>)}</tr></thead>
    <tbody className="divide-y divide-slate-100 bg-white">{contracts.map((contract) => <tr key={contract.id} className="transition-colors hover:bg-slate-50">
      <td className="whitespace-nowrap px-4 py-3 pl-5 font-semibold text-slate-800">{contract.contractId}</td>
      <td className="min-w-44 px-4 py-3"><Link to={`/employees/${contract.employeeId}`} className="font-semibold text-slate-900 hover:underline">{contract.employeeName}</Link><p className="text-xs text-slate-500">{contract.employeeId}</p></td>
      <td className="px-4 py-3 text-slate-600">{contract.position}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{contract.employmentType}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(contract.startDate)}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(contract.endDate)}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{contract.workingSchedule}</td><td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums text-slate-700">{moneyFormatter.format(contract.baseWage)}</td><td className="whitespace-nowrap px-4 py-3"><ContractStatusBadge status={contract.status} /></td>
      <td className="whitespace-nowrap px-4 py-3 pr-5"><div className="flex gap-3 font-semibold"><Link to={`/contracts/${contract.id}`} className="text-slate-700 hover:underline">View</Link><Link to={`/contracts/${contract.id}/edit`} className="text-blue-700 hover:underline">Edit</Link></div></td>
    </tr>)}</tbody>
  </table></div>;
}
