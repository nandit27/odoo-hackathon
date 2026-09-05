import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { createContract, getContractById, updateContract } from "../api/contracts.js";
import { getEmployees } from "../api/employees.js";
import ContractForm from "../components/hr/ContractForm.jsx";

const emptyContract = { contractId: "", employeeId: "", employeeName: "", position: "", employmentType: "", startDate: "", endDate: "", workingSchedule: "", baseWage: "", payFrequency: "Monthly", status: "Draft", notes: "" };

export default function ContractFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [contract, setContract] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    Promise.all([getEmployees(), editing ? getContractById(id) : Promise.resolve(null)])
      .then(([people, existing]) => {
        setEmployees(people);
        if (existing) setContract(existing);
        else {
          const employee = people.find((item) => item.id === searchParams.get("employeeId"));
          setContract(employee ? { ...emptyContract, employeeId: employee.id, employeeName: employee.fullName, position: employee.position, employmentType: employee.employmentType, workingSchedule: employee.workingSchedule } : emptyContract);
        }
      }).catch((err) => setLoadError(err.message || "Contract form could not be loaded."));
  }, [editing, id, searchParams]);
  async function save(values) {
    setSubmitting(true); setSaveError("");
    try { const saved = editing ? await updateContract(id, values) : await createContract(values); navigate(`/contracts/${saved.id}`); }
    catch (err) { setSaveError(err.message || "Contract could not be saved."); setSubmitting(false); }
  }
  const cancel = () => navigate(editing ? `/contracts/${id}` : "/contracts");
  if (loadError) return <div className="border border-red-200 bg-red-50 p-6 text-sm text-red-700">{loadError} <Link to="/contracts" className="font-semibold underline">Back to contracts</Link></div>;
  if (!contract) return <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">Loading contract…</div>;
  return <section className="max-w-5xl"><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Human Resources</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{editing ? "Edit contract" : "Add contract"}</h1><p className="mt-1 text-sm text-slate-600">{editing ? `Update ${contract.contractId} without changing payroll calculations.` : "Create an employment contract record."}</p></div><ContractForm initialValues={contract} employees={employees} onSubmit={save} onCancel={cancel} submitting={submitting} serverError={saveError} /></section>;
}
