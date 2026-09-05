import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllocationsByEmployee } from "../api/allocations.js";
import { getCurrentEmployee } from "../api/currentEmployee.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { createTimeOffRequest } from "../api/timeOff.js";
import { getTimeOffTypes } from "../api/timeOffTypes.js";
import TimeOffRequestForm from "../components/hr/TimeOffRequestForm.jsx";

export default function MyTimeOffForm() {
  const { employeeId } = useAuth();
  const navigate = useNavigate(); const [data, setData] = useState(null); const [error, setError] = useState(""); const [submitting, setSubmitting] = useState(false);
  useEffect(() => { Promise.all([getCurrentEmployee(employeeId), getTimeOffTypes(), getAllocationsByEmployee(employeeId)]).then(([employee, types, allocations]) => setData({ employee, types, allocations })).catch(() => setError("The request form could not be loaded.")); }, [employeeId]);
  async function save(values) { setSubmitting(true); setError(""); try { await createTimeOffRequest(values); navigate("/me/timeoff"); } catch (err) { setError(err.message || "Your request could not be submitted."); setSubmitting(false); } }
  if (!data) return <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">{error || "Loading request form…"}</div>;
  const initial = { employeeId: data.employee.employeeId, employeeName: data.employee.fullName, timeOffTypeId: "", timeOffTypeName: "", startDate: "", endDate: "", reason: "", availableBalance: null, status: "Draft" };
  return <section className="max-w-5xl"><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Employee self-service</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Request time off</h1><p className="mt-1 text-sm text-slate-600">Submit a leave request against your available balance.</p></div><div className="mb-4 border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"><span className="text-slate-500">Employee</span><span className="ml-3 font-semibold">{data.employee.fullName} ({data.employee.employeeId})</span></div><TimeOffRequestForm initialValues={initial} employees={[data.employee]} types={data.types} allocations={data.allocations} onSubmit={save} onCancel={() => navigate("/me/timeoff")} submitting={submitting} serverError={error} /><div className="mt-3"><Link to="/me/timeoff" className="text-sm font-medium text-slate-600 hover:text-slate-950">Back to my requests</Link></div></section>;
}
