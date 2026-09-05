import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getContracts, getContractsByEmployee } from "../api/contracts.js";
import { getEmployeeById } from "../api/employees.js";
import ContractFilterBar from "../components/hr/ContractFilterBar.jsx";
import ContractTable from "../components/hr/ContractTable.jsx";

export default function Contracts() {
  const { employeeId } = useParams();
  const [contracts, setContracts] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  useEffect(() => {
    setLoading(true); setError("");
    const request = employeeId ? Promise.all([getContractsByEmployee(employeeId), getEmployeeById(employeeId)]) : Promise.all([getContracts(), Promise.resolve(null)]);
    request.then(([items, person]) => { setContracts(items); setEmployee(person); }).catch((err) => setError(err.message || "Contracts could not be loaded.")).finally(() => setLoading(false));
  }, [employeeId]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return contracts.filter((item) => (!query || item.contractId.toLowerCase().includes(query) || item.employeeName.toLowerCase().includes(query)) && (!status || item.status === status) && (!employmentType || item.employmentType === employmentType));
  }, [contracts, search, status, employmentType]);
  const clear = () => { setSearch(""); setStatus(""); setEmploymentType(""); };
  return <section>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Human Resources</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{employee ? `${employee.fullName}'s contracts` : "Contracts"}</h1><p className="mt-1 text-sm text-slate-600">{employee ? "Review current and historical employment contracts." : "Manage current and historical employee contracts."}</p></div><div className="flex gap-2">{employee && <Link to={`/employees/${employee.id}`} className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">View employee</Link>}<Link to={employee ? `/contracts/new?employeeId=${employee.id}` : "/contracts/new"} className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">Add contract</Link></div></div>
    <div className="overflow-hidden border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-3"><p className="text-sm text-slate-600"><span className="font-semibold text-slate-950">{filtered.length}</span> {filtered.length === 1 ? "contract" : "contracts"}</p></div><ContractFilterBar {...{ search, status, employmentType }} onSearch={setSearch} onStatus={setStatus} onEmploymentType={setEmploymentType} onClear={clear} />
      {loading ? <State title="Loading contracts…" /> : error ? <State title={error} error /> : !filtered.length ? <State title={contracts.length ? "No contracts match your filters." : "No contracts found."} detail={contracts.length ? "Try changing or clearing the current filters." : "Add a contract to begin this employee's contract history."} /> : <ContractTable contracts={filtered} />}
    </div>
  </section>;
}
function State({ title, detail, error }) { return <div className="px-6 py-16 text-center"><p className={`text-sm font-medium ${error ? "text-red-700" : "text-slate-700"}`}>{title}</p>{detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}</div>; }
