import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getWorkingSchedules } from "../api/workingSchedules.js";
import ScheduleFilterBar from "../components/hr/ScheduleFilterBar.jsx";
import WorkingScheduleTable from "../components/hr/WorkingScheduleTable.jsx";

export default function WorkingSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => { getWorkingSchedules().then(setSchedules).catch(() => setError("Working schedules could not be loaded.")).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => { const query = search.trim().toLowerCase(); return schedules.filter((item) => (!query || item.name.toLowerCase().includes(query) || item.timeZone.toLowerCase().includes(query)) && (!status || item.status === status)); }, [schedules, search, status]);
  const clear = () => { setSearch(""); setStatus(""); };
  return <section><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Human Resources</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Working schedules</h1><p className="mt-1 text-sm text-slate-600">Define expected working hours and weekly shift patterns.</p></div><Link to="/working-schedules/new" className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">Add schedule</Link></div>
    <div className="overflow-hidden border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-3"><p className="text-sm text-slate-600"><span className="font-semibold text-slate-950">{filtered.length}</span> {filtered.length === 1 ? "schedule" : "schedules"}</p></div><ScheduleFilterBar {...{ search, status }} onSearch={setSearch} onStatus={setStatus} onClear={clear} />{loading ? <State title="Loading schedules…" /> : error ? <State title={error} error /> : !filtered.length ? <State title={schedules.length ? "No schedules match your filters." : "No working schedules yet."} detail={schedules.length ? "Try changing or clearing the current filters." : "Add a schedule to define expected working hours."} /> : <WorkingScheduleTable schedules={filtered} />}</div>
  </section>;
}
function State({ title, detail, error }) { return <div className="px-6 py-16 text-center"><p className={`text-sm font-medium ${error ? "text-red-700" : "text-slate-700"}`}>{title}</p>{detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}</div>; }
