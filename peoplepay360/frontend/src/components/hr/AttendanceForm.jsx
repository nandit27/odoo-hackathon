import { useState } from "react";
import { calculateAttendanceDifference, calculateWorkedHours } from "../../api/attendance.js";

const expectedHoursFor = (schedule) => schedule.startsWith("Flexible") ? 6.5 : 8;
export default function AttendanceForm({ initialValues, employees, onSubmit, onCancel, submitting, serverError }) {
  const [values, setValues] = useState(initialValues); const [errors, setErrors] = useState({});
  const inputClass = "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
  function change(event) {
    const next = { ...values, [event.target.name]: event.target.value };
    if (event.target.name === "employeeId") { const employee = employees.find((item) => item.id === event.target.value); if (employee) { next.employeeName = employee.fullName; next.department = employee.department; next.workingSchedule = employee.workingSchedule; next.expectedHours = expectedHoursFor(employee.workingSchedule); } }
    setValues(next); setErrors((current) => ({ ...current, [event.target.name]: "" }));
  }
  function submit(event) {
    event.preventDefault(); const next = {};
    if (!values.employeeId) next.employeeId = "Employee is required.";
    if (!values.date) next.date = "Date is required.";
    if (values.checkIn && values.checkOut && values.checkOut < values.checkIn) next.checkOut = "Check out cannot be before check in.";
    setErrors(next); if (!Object.keys(next).length) onSubmit(values);
  }
  const worked = calculateWorkedHours(values.checkIn, values.checkOut); const difference = calculateAttendanceDifference(values);
  return <form onSubmit={submit} noValidate className="overflow-hidden border border-slate-200 bg-white shadow-sm">{serverError && <div role="alert" className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">{serverError}</div>}<div className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
    <label className="text-sm font-medium text-slate-700">Employee <Required /><select name="employeeId" value={values.employeeId} onChange={change} className={inputClass}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} ({employee.employeeId})</option>)}</select><Error text={errors.employeeId} /></label><Field label="Date" name="date" type="date" value={values.date} onChange={change} error={errors.date} className={inputClass} /><Field label="Check in" name="checkIn" type="time" value={values.checkIn} onChange={change} error={errors.checkIn} className={inputClass} optional /><Field label="Check out" name="checkOut" type="time" value={values.checkOut} onChange={change} error={errors.checkOut} className={inputClass} optional /><label className="text-sm font-medium text-slate-700">Status <Required /><select name="status" value={values.status} onChange={change} className={inputClass}><option>Present</option><option>Late</option><option>Absent</option><option>Missing Checkout</option><option>On Leave</option></select></label><div className="grid grid-cols-3 gap-3 rounded-md border border-slate-200 bg-slate-50 p-3"><Metric label="Worked" value={worked} /><Metric label="Expected" value={values.expectedHours} /><Metric label="Difference" value={difference} signed /></div><label className="text-sm font-medium text-slate-700 sm:col-span-2">Notes / reason <span className="font-normal text-slate-400">(optional)</span><textarea name="notes" rows="4" value={values.notes} onChange={change} className={inputClass} /></label>
  </div><div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6"><button type="button" onClick={onCancel} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" disabled={submitting} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{submitting ? "Saving…" : "Save attendance"}</button></div></form>;
}
function Metric({ label, value, signed }) { return <div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{value === null ? "—" : `${signed && value > 0 ? "+" : ""}${value} h`}</p></div>; }
function Field({ label, name, type, value, onChange, error, className, optional }) { return <label className="text-sm font-medium text-slate-700">{label} {optional ? <span className="font-normal text-slate-400">(optional)</span> : <Required />}<input name={name} type={type} value={value} onChange={onChange} className={className} aria-invalid={Boolean(error)} /><Error text={error} /></label>; }
function Required() { return <span className="text-red-600">*</span>; } function Error({ text }) { return text ? <span className="mt-1 block text-xs text-red-600">{text}</span> : null; }
