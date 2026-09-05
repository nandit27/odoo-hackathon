import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { createAttendance, getAttendanceById, updateAttendance } from "../api/attendance.js";
import { getEmployees } from "../api/employees.js";
import AttendanceForm from "../components/hr/AttendanceForm.jsx";

const emptyRecord = { employeeId: "", employeeName: "", department: "", date: "", checkIn: "", checkOut: "", expectedHours: 0, workingSchedule: "", status: "Present", notes: "" };
const expectedHoursFor = (schedule) => schedule.startsWith("Flexible") ? 6.5 : 8;
export default function AttendanceFormPage() {
  const { id } = useParams(); const [searchParams] = useSearchParams(); const navigate = useNavigate(); const editing = Boolean(id);
  const [record, setRecord] = useState(null); const [employees, setEmployees] = useState([]); const [loadError, setLoadError] = useState(""); const [saveError, setSaveError] = useState(""); const [submitting, setSubmitting] = useState(false);
  useEffect(() => { Promise.all([getEmployees(), editing ? getAttendanceById(id) : Promise.resolve(null)]).then(([people, existing]) => { setEmployees(people); if (existing) setRecord(existing); else { const employee = people.find((item) => item.id === searchParams.get("employeeId")); setRecord(employee ? { ...emptyRecord, employeeId: employee.id, employeeName: employee.fullName, department: employee.department, workingSchedule: employee.workingSchedule, expectedHours: expectedHoursFor(employee.workingSchedule) } : emptyRecord); } }).catch((err) => setLoadError(err.message || "Attendance form could not be loaded.")); }, [editing, id, searchParams]);
  async function save(values) { setSubmitting(true); setSaveError(""); try { const saved = editing ? await updateAttendance(id, values) : await createAttendance(values); navigate(`/attendance/${saved.id}`); } catch (err) { setSaveError(err.message || "Attendance could not be saved."); setSubmitting(false); } }
  const cancel = () => navigate(editing ? `/attendance/${id}` : "/attendance");
  if (loadError) return <div className="border border-red-200 bg-red-50 p-6 text-sm text-red-700">{loadError} <Link to="/attendance" className="font-semibold underline">Back to attendance</Link></div>;
  if (!record) return <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">Loading attendance…</div>;
  return <section className="max-w-5xl"><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Human Resources</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{editing ? "Edit attendance" : "Add attendance"}</h1><p className="mt-1 text-sm text-slate-600">Record actual employee time; expected hours remain a schedule reference.</p></div><AttendanceForm initialValues={record} employees={employees} onSubmit={save} onCancel={cancel} submitting={submitting} serverError={saveError} /></section>;
}
