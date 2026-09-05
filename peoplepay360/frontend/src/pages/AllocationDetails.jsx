import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  calculateRemainingDays,
  getAllocationById,
} from "../api/allocations.js";
import AllocationStatusBadge from "../components/hr/AllocationStatusBadge.jsx";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const date = (value) => dateFormatter.format(new Date(`${value}T00:00:00`));
const days = (value) =>
  `${Number(value).toFixed(Number(value) % 1 ? 1 : 0)} days`;
export default function AllocationDetails() {
  const { id } = useParams();
  const [allocation, setAllocation] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getAllocationById(id)
      .then(setAllocation)
      .catch((err) => setError(err.message));
  }, [id]);
  if (error) return <Message text={error} />;
  if (!allocation) return <Message text="Loading allocation…" hideLink />;
  const remaining = calculateRemainingDays(allocation);
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/allocations"
          className="text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          ← Back to allocations
        </Link>
        <div className="flex gap-2">
          <Link
            to={`/employees/${allocation.employeeId}`}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View employee
          </Link>
          <Link
            to={`/allocations/${id}/edit`}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Edit allocation
          </Link>
        </div>
      </div>
      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Leave allocation · {allocation.id}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {allocation.employeeName}
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-700">
              {allocation.timeOffTypeName}
            </p>
          </div>
          <AllocationStatusBadge status={allocation.status} />
        </header>
        <div className="grid border-b border-slate-200 sm:grid-cols-3">
          <Balance label="Allocated" value={allocation.allocatedDays} />
          <Balance label="Used" value={allocation.usedDays} border />
          <Balance label="Remaining" value={remaining} border accent />
        </div>
        <div className="divide-y divide-slate-200 px-5 sm:px-6">
          <Info
            title="Entitlement"
            items={[
              ["Employee", allocation.employeeName],
              ["Time off type", allocation.timeOffTypeName],
              ["Valid from", date(allocation.validFrom)],
              ["Valid until", date(allocation.validUntil)],
              ["Status", allocation.status],
            ]}
          />
          <Info title="Notes" items={[["Notes", allocation.notes || "—"]]} />
        </div>
      </div>
    </section>
  );
}
function Balance({ label, value, border, accent }) {
  return (
    <div
      className={`px-5 py-4 ${border ? "border-t border-slate-200 sm:border-l sm:border-t-0" : ""}`}
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold tabular-nums ${accent ? "text-emerald-700" : "text-slate-950"}`}
      >
        {days(value)}
      </p>
    </div>
  );
}
function Info({ title, items }) {
  return (
    <section className="py-6">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h2>
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
function Message({ text, hideLink }) {
  return (
    <div className="border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
      {text}
      {!hideLink && (
        <div className="mt-3">
          <Link
            to="/allocations"
            className="font-semibold text-blue-700 hover:underline"
          >
            Back to allocations
          </Link>
        </div>
      )}
    </div>
  );
}
