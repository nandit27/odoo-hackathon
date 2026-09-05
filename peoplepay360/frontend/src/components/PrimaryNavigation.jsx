import { NavLink, useLocation } from "react-router-dom";

const isPathActive = (pathname, to) => to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

export default function PrimaryNavigation({ items }) {
  const { pathname } = useLocation();
  const linkClass = ({ isActive }) => `block rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 ${isActive ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`;

  return <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
    {items.map((item) => item.items ? <details key={item.to} className="group relative">
      <summary className={`cursor-pointer list-none rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 [&::-webkit-details-marker]:hidden ${item.items.some(([, to]) => isPathActive(pathname, to)) ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
        {item.label}<span aria-hidden="true" className="ml-1 text-[10px] text-slate-400">▼</span>
      </summary>
      <div className="absolute left-0 z-20 mt-1 min-w-48 border border-slate-200 bg-white p-1 shadow-lg">
        {item.items.map(([label, to]) => <NavLink key={to} to={to} end={to === "/employees" || to === "/contracts" || to === "/timeoff"} onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")} className={linkClass}>{label}</NavLink>)}
      </div>
    </details> : <NavLink key={item.to} to={item.to} end={item.to === "/" || item.to === "/me"} className={linkClass}>{item.label}</NavLink>)}
  </div>;
}
