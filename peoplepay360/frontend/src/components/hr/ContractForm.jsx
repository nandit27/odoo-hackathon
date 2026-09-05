import { useState } from "react";

export default function ContractForm({ initialValues, employees, onSubmit, onCancel, submitting, serverError }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const inputClass = "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
  function change(event) {
    const next = { ...values, [event.target.name]: event.target.value };
    if (event.target.name === "employeeId") {
      const employee = employees.find((item) => item.id === event.target.value);
      if (employee) { next.employeeName = employee.fullName; next.position = employee.position; next.employmentType = employee.employmentType; next.workingSchedule = employee.workingSchedule; }
    }
    setValues(next); setErrors((current) => ({ ...current, [event.target.name]: "" }));
  }
  function submit(event) {
    event.preventDefault(); const next = {};
    if (!values.contractId.trim()) next.contractId = "Contract ID is required.";
    if (!values.employeeId) next.employeeId = "Employee is required.";
    if (!values.position.trim()) next.position = "Job position is required.";
    if (!values.employmentType) next.employmentType = "Employment type is required.";
    if (!values.startDate) next.startDate = "Start date is required.";
    if (values.endDate && values.startDate && values.endDate < values.startDate) next.endDate = "End date cannot be earlier than start date.";
    if (values.baseWage === "" || !Number.isFinite(Number(values.baseWage)) || Number(values.baseWage) < 0) next.baseWage = "Base wage must be a non-negative number.";
    if (!values.workingSchedule.trim()) next.workingSchedule = "Working schedule is required.";
    if (!values.payFrequency) next.payFrequency = "Pay frequency is required.";
    if (!values.status) next.status = "Status is required.";
    setErrors(next); if (!Object.keys(next).length) onSubmit(values);
  }
  return <form onSubmit={submit} noValidate className="overflow-hidden border border-slate-200 bg-white shadow-sm">
    {serverError && <div role="alert" className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">{serverError}</div>}
    <div className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
      <Field label="Contract ID" name="contractId" value={values.contractId} onChange={change} error={errors.contractId} className={inputClass} />
      <label className="text-sm font-medium text-slate-700">Employee <Required /><select name="employeeId" value={values.employeeId} onChange={change} className={inputClass}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} ({employee.employeeId})</option>)}</select><Error text={errors.employeeId} /></label>
      <Field label="Job position" name="position" value={values.position} onChange={change} error={errors.position} className={inputClass} />
      <Select label="Employment type" name="employmentType" value={values.employmentType} onChange={change} error={errors.employmentType} className={inputClass} options={["Full-time", "Part-time", "Contract", "Intern"]} />
      <Field label="Start date" name="startDate" type="date" value={values.startDate} onChange={change} error={errors.startDate} className={inputClass} />
      <Field label="End date" name="endDate" type="date" value={values.endDate} onChange={change} error={errors.endDate} className={inputClass} optional />
      <Field label="Working schedule" name="workingSchedule" value={values.workingSchedule} onChange={change} error={errors.workingSchedule} className={inputClass} />
      <Field label="Base wage / salary" name="baseWage" type="number" min="0" step="0.01" value={values.baseWage} onChange={change} error={errors.baseWage} className={inputClass} />
      <Select label="Pay frequency" name="payFrequency" value={values.payFrequency} onChange={change} error={errors.payFrequency} className={inputClass} options={["Monthly", "Biweekly", "Weekly"]} />
      <Select label="Status" name="status" value={values.status} onChange={change} error={errors.status} className={inputClass} options={["Draft", "Active", "Expired", "Cancelled"]} />
      <label className="text-sm font-medium text-slate-700 sm:col-span-2">Notes <span className="font-normal text-slate-400">(optional)</span><textarea name="notes" rows="4" value={values.notes} onChange={change} className={inputClass} /></label>
    </div>
    <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6"><button type="button" onClick={onCancel} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" disabled={submitting} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{submitting ? "Saving…" : "Save contract"}</button></div>
  </form>;
}

function Field({ label, name, type = "text", value, onChange, error, className, optional, ...props }) { return <label className="text-sm font-medium text-slate-700">{label} {optional ? <span className="font-normal text-slate-400">(optional)</span> : <Required />}<input {...props} name={name} type={type} value={value} onChange={onChange} className={className} aria-invalid={Boolean(error)} /><Error text={error} /></label>; }
function Select({ label, name, value, onChange, error, className, options }) { return <label className="text-sm font-medium text-slate-700">{label} <Required /><select name={name} value={value} onChange={onChange} className={className}><option value="">Select {label.toLowerCase()}</option>{options.map((item) => <option key={item}>{item}</option>)}</select><Error text={error} /></label>; }
function Required() { return <span className="text-red-600">*</span>; }
function Error({ text }) { return text ? <span className="mt-1 block text-xs text-red-600">{text}</span> : null; }
