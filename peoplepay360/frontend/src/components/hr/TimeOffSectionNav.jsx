import { NavLink } from "react-router-dom";

const sections = [
  ["Requests", "/timeoff"],
  ["Allocations", "/allocations"],
  ["Time Off Types", "/time-off-types"],
];

export default function TimeOffSectionNav() {
  return <nav aria-label="Time Off sections" className="mb-5 overflow-x-auto border-b border-slate-300">
    <div className="flex min-w-max gap-6">
      {sections.map(([label, to]) => <NavLink key={to} to={to} end className={({ isActive }) => `border-b-2 px-1 pb-2.5 text-sm font-semibold transition-colors ${isActive ? "border-slate-900 text-slate-950" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"}`}>{label}</NavLink>)}
    </div>
  </nav>;
}
