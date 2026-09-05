import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getTimeOffTypes } from "../api/timeOffTypes.js";
import TimeOffTypeFilterBar from "../components/hr/TimeOffTypeFilterBar.jsx";
import TimeOffTypeTable from "../components/hr/TimeOffTypeTable.jsx";
import TimeOffSectionNav from "../components/hr/TimeOffSectionNav.jsx";

export default function TimeOffTypes() {
  const [types, setTypes] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [search, setSearch] = useState(""); const [status, setStatus] = useState("");
  useEffect(() => { getTimeOffTypes().then(setTypes).catch(() => setError("Time off types could not be loaded.")).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => { const query = search.trim().toLowerCase(); return types.filter((item) => (!query || item.name.toLowerCase().includes(query) || item.code.toLowerCase().includes(query)) && (!status || item.status === status)); }, [types, search, status]);
  const clear = () => { setSearch(""); setStatus(""); };
  return <section><TimeOffSectionNav /><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Human Resources · Configuration</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Time off types</h1><p className="mt-1 text-sm text-slate-600">Define the leave categories available to your organization.</p></div><Link to="/time-off-types/new" className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">Add time off type</Link></div><div className="overflow-hidden border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-3"><p className="text-sm text-slate-600"><span className="font-semibold text-slate-950">{filtered.length}</span> {filtered.length === 1 ? "type" : "types"}</p></div><TimeOffTypeFilterBar {...{ search, status }} onSearch={setSearch} onStatus={setStatus} onClear={clear} />{loading ? <State title="Loading time off types…" /> : error ? <State title={error} error /> : !filtered.length ? <State title={types.length ? "No time off types match your filters." : "No time off types configured."} detail={types.length ? "Try changing or clearing the current filters." : "Add a type to configure available leave categories."} /> : <TimeOffTypeTable types={filtered} />}</div></section>;
}
function State({ title, detail, error }) { return <div className="px-6 py-16 text-center"><p className={`text-sm font-medium ${error ? "text-red-700" : "text-slate-700"}`}>{title}</p>{detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}</div>; }
