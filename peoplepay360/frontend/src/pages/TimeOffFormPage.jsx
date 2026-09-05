import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getAllocations } from "../api/allocations.js";
import { getEmployees } from "../api/employees.js";
import { createTimeOffRequest, getTimeOffRequestById, updateTimeOffRequest } from "../api/timeOff.js";
import { getTimeOffTypes } from "../api/timeOffTypes.js";
import TimeOffRequestForm from "../components/hr/TimeOffRequestForm.jsx";

const emptyRequest = { employeeId: "", employeeName: "", timeOffTypeId: "", timeOffTypeName: "", startDate: "", endDate: "", reason: "", availableBalance: null, status: "Draft" };
export default function TimeOffFormPage() {
  const { id } = useParams(); const [searchParams] = useSearchParams(); const navigate = useNavigate(); const editing = Boolean(id); const [request, setRequest] = useState(null); const [employees, setEmployees] = useState([]); const [types, setTypes] = useState([]); const [allocations, setAllocations] = useState([]); const [loadError, setLoadError] = useState(""); const [saveError, setSaveError] = useState(""); const [submitting, setSubmitting] = useState(false);
  useEffect(() => { Promise.all([getEmployees(), getTimeOffTypes(), getAllocations(), editing ? getTimeOffRequestById(id) : Promise.resolve(null)]).then(([people, leaveTypes, balances, existing]) => { setEmployees(people); setTypes(leaveTypes); setAllocations(balances); if (existing) setRequest(existing); else { const employee = people.find((item) => item.id === searchParams.get("employeeId")); setRequest(employee ? { ...emptyRequest, employeeId: employee.id, employeeName: employee.fullName } : emptyRequest); } }).catch((err) => setLoadError(err.message || "Request form could not be loaded.")); }, [editing, id, searchParams]);
  async function save(values) { setSubmitting(true); setSaveError(""); try { const saved = editing ? await updateTimeOffRequest(id, values) : await createTimeOffRequest(values); navigate(`/timeoff/${saved.id}`); } catch (err) { setSaveError(err.message || "Time off request could not be saved."); setSubmitting(false); } }
  const cancel = () => navigate(editing ? `/timeoff/${id}` : "/timeoff");
  if (loadError) return <div className="border border-red-200 bg-red-50 p-6 text-sm text-red-700">{loadError} <Link to="/timeoff" className="font-semibold underline">Back to time off</Link></div>; if (!request) return <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">Loading request…</div>;
  return <section className="max-w-5xl"><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Human Resources</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{editing ? "Edit time off request" : "New time off request"}</h1><p className="mt-1 text-sm text-slate-600">Request leave against an available allocation balance.</p></div><TimeOffRequestForm initialValues={request} employees={employees} types={types} allocations={allocations} onSubmit={save} onCancel={cancel} submitting={submitting} serverError={saveError} /></section>;
}
