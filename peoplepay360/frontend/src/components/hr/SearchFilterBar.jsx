export default function SearchFilterBar({ search, onSearch, department, onDepartment, status, onStatus, departments, onClear }) {
  const control = "h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
  return <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-5">
    <label className="min-w-0 flex-1 sm:min-w-72 lg:max-w-xl"><span className="sr-only">Search employees</span><input className={`${control} w-full`} type="search" value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search name, ID, or work email" /></label>
    <label><span className="sr-only">Filter by department</span><select className={`${control} w-full sm:w-48`} value={department} onChange={(e) => onDepartment(e.target.value)}><option value="">All departments</option>{departments.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label><span className="sr-only">Filter by status</span><select className={`${control} w-full sm:w-40`} value={status} onChange={(e) => onStatus(e.target.value)}><option value="">All statuses</option><option>Active</option><option>On Leave</option><option>Inactive</option></select></label>
    <button type="button" onClick={onClear} disabled={!search && !department && !status} className="h-10 px-3 text-left text-sm font-medium text-slate-600 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 sm:text-center">Clear filters</button>
  </div>;
}
