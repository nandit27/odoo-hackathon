import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployees } from "../api/employees.js";
import EmployeeCard from "../components/hr/EmployeeCard.jsx";
import EmployeeTable from "../components/hr/EmployeeTable.jsx";
import SearchFilterBar from "../components/hr/SearchFilterBar.jsx";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch(() => setError("Employees could not be loaded. Please try again."))
      .finally(() => setLoading(false));
  }, []);
  const departments = useMemo(
    () => [...new Set(employees.map((item) => item.department))].sort(),
    [employees],
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter(
      (item) =>
        (!query ||
          [item.fullName, item.employeeId, item.workEmail].some((value) =>
            value.toLowerCase().includes(query),
          )) &&
        (!department || item.department === department) &&
        (!status || item.status === status),
    );
  }, [employees, search, department, status]);
  const clear = () => {
    setSearch("");
    setDepartment("");
    setStatus("");
  };
  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Human Resources
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Employees
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage employee records and workplace information.
          </p>
        </div>
        <Link
          to="/employees/new"
          className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Add employee
        </Link>
      </div>
      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-950">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "employee" : "employees"}
          </p>
          <div
            className="inline-flex rounded-md border border-slate-300 bg-white p-0.5"
            aria-label="Employee view"
          >
            <button
              type="button"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
              className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${view === "list" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              List
            </button>
            <button
              type="button"
              aria-pressed={view === "kanban"}
              onClick={() => setView("kanban")}
              className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${view === "kanban" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Kanban
            </button>
          </div>
        </div>
        <SearchFilterBar
          {...{ search, department, status, departments }}
          onSearch={setSearch}
          onDepartment={setDepartment}
          onStatus={setStatus}
          onClear={clear}
        />
        {loading ? (
          <State title="Loading employees…" />
        ) : error ? (
          <State title={error} error />
        ) : filtered.length === 0 ? (
          <State
            title={
              employees.length
                ? "No employees match your filters."
                : "No employee records yet."
            }
            detail={
              employees.length
                ? "Try changing or clearing the current filters."
                : "Add your first employee to get started."
            }
          />
        ) : view === "list" ? (
          <EmployeeTable employees={filtered} />
        ) : (
          <div className="grid gap-3 bg-slate-50/70 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
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
