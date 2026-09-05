import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getContractById } from "../api/contracts.js";
import ContractStatusBadge from "../components/hr/ContractStatusBadge.jsx";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });
const moneyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const formatDate = (value) => value ? dateFormatter.format(new Date(`${value}T00:00:00`)) : "Open-ended";

export default function ContractDetails() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { getContractById(id).then(setContract).catch((err) => setError(err.message)); }, [id]);
  if (error) return <Message text={error} />;
  if (!contract) return <Message text="Loading contract…" hideLink />;
  return <section>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><Link to="/contracts" className="text-sm font-medium text-slate-600 hover:text-slate-950">← Back to contracts</Link><div className="flex gap-2"><Link to={`/employees/${contract.employeeId}`} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">View employee</Link><Link to={`/contracts/${id}/edit`} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">Edit contract</Link></div></div>
    <div className="overflow-hidden border border-slate-200 bg-white shadow-sm"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5 sm:p-6"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Employment contract</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{contract.contractId}</h1><p className="mt-2 text-sm font-medium text-slate-700">{contract.employeeName} · {contract.position}</p></div><ContractStatusBadge status={contract.status} /></header>
      <div className="grid divide-y divide-slate-200 px-5 sm:px-6 lg:grid-cols-2 lg:divide-x lg:divide-y-0"><div className="lg:pr-8"><Info title="Employment" items={[["Employee", contract.employeeName], ["Job position", contract.position], ["Employment type", contract.employmentType]]} /><Info title="Contract period" items={[["Start date", formatDate(contract.startDate)], ["End date", formatDate(contract.endDate)], ["Status", contract.status]]} /></div><div className="lg:pl-8"><Info title="Work configuration" items={[["Working schedule", contract.workingSchedule], ["Pay frequency", contract.payFrequency]]} /><Info title="Compensation reference" items={[["Base wage", moneyFormatter.format(contract.baseWage)]]} />{contract.notes && <Info title="Notes" items={[["Contract notes", contract.notes]]} />}</div></div>
    </div>
  </section>;
}
function Info({ title, items }) { return <section className="border-b border-slate-200 py-6 last:border-b-0"><h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h2><dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">{items.map(([label, value]) => <div key={label}><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 text-sm text-slate-900">{value || "—"}</dd></div>)}</dl></section>; }
function Message({ text, hideLink }) { return <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">{text}{!hideLink && <div className="mt-3"><Link to="/contracts" className="font-semibold text-blue-700 hover:underline">Back to contracts</Link></div>}</div>; }
