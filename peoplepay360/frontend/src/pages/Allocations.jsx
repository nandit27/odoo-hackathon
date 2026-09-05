import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getAllocations,
  getAllocationsByEmployee,
} from "../api/allocations.js";
import { getEmployeeById } from "../api/employees.js";
import { getTimeOffTypes } from "../api/timeOffTypes.js";
import AllocationFilterBar from "../components/hr/AllocationFilterBar.jsx";
import AllocationTable from "../components/hr/AllocationTable.jsx";
import TimeOffSectionNav from "../components/hr/TimeOffSectionNav.jsx";

export default function Allocations() {
  const { employeeId } = useParams();
  const [allocations, setAllocations] = useState([]);
  const [types, setTypes] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeId, setTypeId] = useState("");
  const [status, setStatus] = useState("");
  const [year, setYear] = useState("");
  useEffect(() => {
    setLoading(true);
    const request = employeeId
      ? Promise.all([
          getAllocationsByEmployee(employeeId),
          getTimeOffTypes(),
          getEmployeeById(employeeId),
        ])
      : Promise.all([
          getAllocations(),
          getTimeOffTypes(),
          Promise.resolve(null),
        ]);
    request
      .then(([items, leaveTypes, person]) => {
        setAllocations(items);
        setTypes(leaveTypes);
        setEmployee(person);
      })
      .catch((err) =>
        setError(err.message || "Allocations could not be loaded."),
      )
      .finally(() => setLoading(false));
  }, [employeeId]);
  const years = useMemo(
    () =>
      [
        ...new Set(
          allocations.flatMap((item) => [
            item.validFrom.slice(0, 4),
            item.validUntil.slice(0, 4),
          ]),
        ),
      ]
        .sort()
        .reverse(),
    [allocations],
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allocations.filter(
      (item) =>
        (!query ||
          item.employeeName.toLowerCase().includes(query) ||
          item.employeeId.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query)) &&
        (!typeId || item.timeOffTypeId === typeId) &&
        (!status || item.status === status) &&
        (!year ||
          (item.validFrom <= `${year}-12-31` &&
            item.validUntil >= `${year}-01-01`)),
    );
  }, [allocations, search, typeId, status, year]);
  const clear = () => {
    setSearch("");
    setTypeId("");
    setStatus("");
    setYear("");
  };
  return (
    <section>
      {!employeeId && <TimeOffSectionNav />}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Human Resources
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {employee
              ? `${employee.fullName}'s allocations`
              : "Leave allocations"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage employee leave entitlement and available balances.
          </p>
        </div>
        <div className="flex gap-2">
          {employee && (
            <Link
              to={`/employees/${employee.id}`}
              className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View employee
            </Link>
          )}
          <Link
            to={
              employee
                ? `/allocations/new?employeeId=${employee.id}`
                : "/allocations/new"
            }
            className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Add allocation
          </Link>
        </div>
      </div>
      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-950">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "allocation" : "allocations"}
          </p>
        </div>
        <AllocationFilterBar
          {...{ search, typeId, types, status, year, years }}
          onSearch={setSearch}
          onTypeId={setTypeId}
          onStatus={setStatus}
          onYear={setYear}
          onClear={clear}
        />
        {loading ? (
          <State title="Loading allocations…" />
        ) : error ? (
          <State title={error} error />
        ) : !filtered.length ? (
          <State
            title={
              allocations.length
                ? "No allocations match your filters."
                : "No allocations found."
            }
            detail={
              allocations.length
                ? "Try changing or clearing the current filters."
                : "Add an allocation to define leave entitlement."
            }
          />
        ) : (
          <AllocationTable allocations={filtered} />
        )}
      </div>
    </section>
  );
}
function State({ title, detail, error }) {
  return (
    <div className="px-6 py-16 text-center">
      <p
        className={`text-sm font-medium ${error ? "text-red-700" : "text-slate-700"}`}
      >
        {title}
      </p>
      {detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}
    </div>
  );
}
