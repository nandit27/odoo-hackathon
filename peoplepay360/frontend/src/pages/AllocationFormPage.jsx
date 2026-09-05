import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  createAllocation,
  getAllocationById,
  updateAllocation,
} from "../api/allocations.js";
import { getEmployees } from "../api/employees.js";
import { getTimeOffTypes } from "../api/timeOffTypes.js";
import AllocationForm from "../components/hr/AllocationForm.jsx";

const emptyAllocation = {
  employeeId: "",
  employeeName: "",
  timeOffTypeId: "",
  timeOffTypeName: "",
  validFrom: "",
  validUntil: "",
  allocatedDays: "",
  usedDays: 0,
  status: "Draft",
  notes: "",
};
export default function AllocationFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [allocation, setAllocation] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [types, setTypes] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    Promise.all([
      getEmployees(),
      getTimeOffTypes(),
      editing ? getAllocationById(id) : Promise.resolve(null),
    ])
      .then(([people, leaveTypes, existing]) => {
        setEmployees(people);
        setTypes(leaveTypes);
        if (existing) setAllocation(existing);
        else {
          const employee = people.find(
            (item) => item.id === searchParams.get("employeeId") || item.employeeId === searchParams.get("employeeId"),
          );
          setAllocation(
            employee
              ? {
                  ...emptyAllocation,
                  employeeId: employee.employeeId,
                  employeeName: employee.fullName,
                }
              : emptyAllocation,
          );
        }
      })
      .catch((err) =>
        setLoadError(err.message || "Allocation form could not be loaded."),
      );
  }, [editing, id, searchParams]);
  async function save(values) {
    setSubmitting(true);
    setSaveError("");
    try {
      const saved = editing
        ? await updateAllocation(id, values)
        : await createAllocation(values);
      navigate(`/allocations/${saved.id}`);
    } catch (err) {
      setSaveError(err.message || "Allocation could not be saved.");
      setSubmitting(false);
    }
  }
  const cancel = () =>
    navigate(editing ? `/allocations/${id}` : "/allocations");
  if (loadError)
    return (
      <div className="border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {loadError}{" "}
        <Link to="/allocations" className="font-semibold underline">
          Back to allocations
        </Link>
      </div>
    );
  if (!allocation)
    return (
      <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
        Loading allocation…
      </div>
    );
  return (
    <section className="max-w-5xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Human Resources
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          {editing ? "Edit allocation" : "Add allocation"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Configure employee leave entitlement; used balances remain
          request-driven.
        </p>
      </div>
      <AllocationForm
        initialValues={allocation}
        employees={employees}
        types={types}
        onSubmit={save}
        onCancel={cancel}
        submitting={submitting}
        serverError={saveError}
      />
    </section>
  );
}
