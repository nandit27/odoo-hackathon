import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createTimeOffType, getTimeOffTypeById, updateTimeOffType } from "../api/timeOffTypes.js";
import TimeOffTypeForm from "../components/hr/TimeOffTypeForm.jsx";

const emptyType = { name: "", code: "", description: "", paid: true, approvalRequired: true, status: "Active" };
export default function TimeOffTypeFormPage() {
  const { id } = useParams(); const navigate = useNavigate(); const editing = Boolean(id); const [type, setType] = useState(editing ? null : emptyType); const [loadError, setLoadError] = useState(""); const [saveError, setSaveError] = useState(""); const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (editing) getTimeOffTypeById(id).then(setType).catch((err) => setLoadError(err.message)); }, [editing, id]);
  async function save(values) { setSubmitting(true); setSaveError(""); try { await (editing ? updateTimeOffType(id, values) : createTimeOffType(values)); navigate("/time-off-types"); } catch (err) { setSaveError(err.message || "Time off type could not be saved."); setSubmitting(false); } }
  const cancel = () => navigate("/time-off-types");
  if (loadError) return <div className="border border-red-200 bg-red-50 p-6 text-sm text-red-700">{loadError} <Link to="/time-off-types" className="font-semibold underline">Back to time off types</Link></div>;
  if (!type) return <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">Loading time off type…</div>;
  return <section className="max-w-4xl"><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Human Resources · Configuration</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{editing ? "Edit time off type" : "Add time off type"}</h1><p className="mt-1 text-sm text-slate-600">Configure a leave category without assigning entitlement or creating a request.</p></div><TimeOffTypeForm initialValues={type} onSubmit={save} onCancel={cancel} submitting={submitting} serverError={saveError} /></section>;
}
