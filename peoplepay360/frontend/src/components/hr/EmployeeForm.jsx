import { useState } from "react";

const fields = [
  ["employeeId", "Employee ID", "text"],
  ["firstName", "First name", "text"],
  ["lastName", "Last name", "text"],
  ["workEmail", "Work email", "email"],
  ["phone", "Phone", "tel"],
  ["department", "Department", "text"],
  ["position", "Position", "text"],
  ["manager", "Manager", "text"],
  ["workingSchedule", "Working schedule", "text"],
  ["joiningDate", "Joining date", "date"],
];
const labels = {
  employeeId: "Employee ID",
  firstName: "First name",
  lastName: "Last name",
  workEmail: "Work email",
  phone: "Phone",
  department: "Department",
  position: "Position",
  manager: "Manager",
  workingSchedule: "Working schedule",
  joiningDate: "Joining date",
  employmentType: "Employment type",
  status: "Status",
  address: "Address",
};

export default function EmployeeForm({
  initialValues,
  managers = [],
  schedules = [],
  onSubmit,
  onCancel,
  submitting,
  serverError,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const inputClass =
    "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
  function change(e) {
    setValues((current) => ({ ...current, [e.target.name]: e.target.value }));
    setErrors((current) => ({ ...current, [e.target.name]: "" }));
  }
  function submit(e) {
    e.preventDefault();
    const next = {};
    Object.keys(labels).forEach((name) => {
      if (!String(values[name] || "").trim())
        next[name] = `${labels[name]} is required.`;
    });
    if (
      values.workEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.workEmail)
    )
      next.workEmail = "Enter a valid work email.";
    if (values.phone && !/^\d{10}$/.test(values.phone))
      next.phone = "Phone number must contain exactly 10 digits.";
    if (
      values.joiningDate &&
      values.joiningDate > new Date().toISOString().slice(0, 10)
    )
      next.joiningDate = "Joining date cannot be in the future.";
    setErrors(next);
    if (!Object.keys(next).length) onSubmit(values);
  }
  return (
    <form
      onSubmit={submit}
      noValidate
      className="overflow-hidden border border-slate-200 bg-white shadow-sm"
    >
      {serverError && (
        <div
          role="alert"
          className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}
      <div className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
        {fields.map(([name, label, type]) => (
          <Field
            key={name}
            {...{ name, label, type, values, errors, change, inputClass }}
          />
        ))}
        <label className="text-sm font-medium text-slate-700">
          Manager
          <select
            name="managerId"
            value={values.managerId || ""}
            onChange={change}
            className={inputClass}
          >
            <option value="">No manager</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.fullName}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Working schedule
          <select
            name="scheduleId"
            value={values.scheduleId || ""}
            onChange={change}
            className={inputClass}
          >
            <option value="">No schedule</option>
            {schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Employment type <Required />
          <select
            name="employmentType"
            value={values.employmentType}
            onChange={change}
            className={inputClass}
          >
            <option value="">Select type</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Intern</option>
          </select>
          <Error text={errors.employmentType} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Status <Required />
          <select
            name="status"
            value={values.status}
            onChange={change}
            className={inputClass}
          >
            <option>Active</option>
            <option>On Leave</option>
            <option>Inactive</option>
          </select>
          <Error text={errors.status} />
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Address <Required />
          <textarea
            name="address"
            rows="3"
            value={values.address}
            onChange={change}
            className={inputClass}
          />
          <Error text={errors.address} />
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save employee"}
        </button>
      </div>
    </form>
  );
}
function Field({ name, label, type, values, errors, change, inputClass }) {
  const phoneProps =
    name === "phone" ? { inputMode: "numeric", autoComplete: "tel" } : {};
  return (
    <label className="text-sm font-medium text-slate-700">
      {label} <Required />
      <input
        name={name}
        type={type}
        value={values[name]}
        onChange={change}
        className={inputClass}
        aria-invalid={Boolean(errors[name])}
        {...phoneProps}
      />
      <Error text={errors[name]} />
    </label>
  );
}
function Required() {
  return <span className="text-red-600">*</span>;
}
function Error({ text }) {
  return text ? (
    <span className="mt-1 block text-xs text-red-600">{text}</span>
  ) : null;
}
