import { Link } from "react-router-dom";
import { calculateRemainingDays } from "../../api/allocations.js";
import AllocationStatusBadge from "./AllocationStatusBadge.jsx";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const date = (value) => dateFormatter.format(new Date(`${value}T00:00:00`));
const days = (value) => `${Number(value).toFixed(Number(value) % 1 ? 1 : 0)} d`;
export default function AllocationTable({ allocations }) {
  const headings = [
    "Allocation ID",
    "Employee",
    "Time off type",
    "Period",
    "Allocated",
    "Used",
    "Remaining",
    "Status",
    "Actions",
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] divide-y divide-slate-200 text-left text-sm xl:min-w-0">
        <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            {headings.map((heading) => (
              <th
                key={heading}
                scope="col"
                className="whitespace-nowrap px-4 py-3 first:pl-5 last:pr-5"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {allocations.map((allocation) => {
            const remaining = calculateRemainingDays(allocation);
            return (
              <tr
                key={allocation.id}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-4 py-3 pl-5 font-semibold text-slate-700">
                  {allocation.id}
                </td>
                <td className="min-w-44 px-4 py-3">
                  <Link
                    to={`/employees/${allocation.employeeId}`}
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    {allocation.employeeName}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {allocation.employeeId}
                  </p>
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">
                  {allocation.timeOffTypeName}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {date(allocation.validFrom)} – {date(allocation.validUntil)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums text-slate-800">
                  {days(allocation.allocatedDays)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">
                  {days(allocation.usedDays)}
                </td>
                <td
                  className={`whitespace-nowrap px-4 py-3 font-semibold tabular-nums ${remaining > 0 ? "text-emerald-700" : "text-slate-700"}`}
                >
                  {days(remaining)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <AllocationStatusBadge status={allocation.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 pr-5">
                  <div className="flex gap-3 font-semibold">
                    <Link
                      to={`/allocations/${allocation.id}`}
                      className="text-slate-700 hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      to={`/allocations/${allocation.id}/edit`}
                      className="text-blue-700 hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
