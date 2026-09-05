import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createWorkingSchedule, getWorkingScheduleById, updateWorkingSchedule, WEEKDAYS } from "../api/workingSchedules.js";
import WorkingScheduleForm from "../components/hr/WorkingScheduleForm.jsx";

const emptySchedule = { name: "", timeZone: "Asia/Kolkata", status: "Active", days: WEEKDAYS.map((day, index) => ({ day, working: index < 5, startTime: index < 5 ? "09:00" : "", endTime: index < 5 ? "18:00" : "", breakMinutes: index < 5 ? 60 : 0 })) };

export default function WorkingScheduleFormPage() {
  const { id } = useParams(); const navigate = useNavigate(); const editing = Boolean(id);
  const [schedule, setSchedule] = useState(editing ? null : emptySchedule); const [loadError, setLoadError] = useState(""); const [saveError, setSaveError] = useState(""); const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (editing) getWorkingScheduleById(id).then(setSchedule).catch((err) => setLoadError(err.message)); }, [editing, id]);
  async function save(values) { setSubmitting(true); setSaveError(""); try { const saved = editing ? await updateWorkingSchedule(id, values) : await createWorkingSchedule(values); navigate(`/working-schedules/${saved.id}`); } catch (err) { setSaveError(err.message || "Working schedule could not be saved."); setSubmitting(false); } }
  const cancel = () => navigate(editing ? `/working-schedules/${id}` : "/working-schedules");
  if (loadError) return <div className="border border-red-200 bg-red-50 p-6 text-sm text-red-700">{loadError} <Link to="/working-schedules" className="font-semibold underline">Back to working schedules</Link></div>;
  if (!schedule) return <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">Loading schedule…</div>;
  return <section><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Human Resources</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{editing ? "Edit working schedule" : "Add working schedule"}</h1><p className="mt-1 text-sm text-slate-600">Configure expected hours without recording actual attendance.</p></div><WorkingScheduleForm initialValues={schedule} onSubmit={save} onCancel={cancel} submitting={submitting} serverError={saveError} /></section>;
}
