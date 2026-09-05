import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createEmployee, getEmployeeById, updateEmployee } from "../api/employees.js";
import EmployeeForm from "../components/hr/EmployeeForm.jsx";

const emptyEmployee = { employeeId: "", firstName: "", lastName: "", workEmail: "", phone: "", department: "", position: "", manager: "", workingSchedule: "", employmentType: "", joiningDate: "", status: "Active", address: "" };

export default function EmployeeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [employee, setEmployee] = useState(editing ? null : emptyEmployee);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (editing) getEmployeeById(id).then(setEmployee).catch((err) => setLoadError(err.message)); }, [editing, id]);
  async function save(values) {
    setSubmitting(true); setSaveError("");
    try { const saved = editing ? await updateEmployee(id, values) : await createEmployee(values); navigate(`/employees/${saved.id}`); }
    catch (err) { setSaveError(err.message || "Employee could not be saved."); setSubmitting(false); }
  }
  const cancel = () => navigate(editing ? `/employees/${id}` : "/employees");
  if (loadError) return <div className="border border-red-200 bg-red-50 p-6 text-sm text-red-700">{loadError} <Link className="font-semibold underline" to="/employees">Back to employees</Link></div>;
  if (!employee) return <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">Loading employee…</div>;
  return <section className="max-w-5xl"><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Human Resources</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{editing ? "Edit employee" : "Add employee"}</h1><p className="mt-1 text-sm text-slate-600">{editing ? `Update ${employee.firstName} ${employee.lastName}'s employee record.` : "Create a new employee record."}</p></div><EmployeeForm initialValues={employee} onSubmit={save} onCancel={cancel} submitting={submitting} serverError={saveError} /></section>;
}
