export default function ContractFilterBar({ search, onSearch, status, onStatus, employmentType, onEmploymentType, onClear }) {
  const control = "h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
  return <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-5">
    <label className="min-w-0 flex-1 sm:min-w-72 lg:max-w-xl"><span className="sr-only">Search contracts</span><input type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search employee or contract ID" className={`${control} w-full`} /></label>
    <label><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => onStatus(event.target.value)} className={`${control} w-full sm:w-40`}><option value="">All statuses</option><option>Draft</option><option>Active</option><option>Expired</option><option>Cancelled</option></select></label>
    <label><span className="sr-only">Filter by employment type</span><select value={employmentType} onChange={(event) => onEmploymentType(event.target.value)} className={`${control} w-full sm:w-48`}><option value="">All employment types</option><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Intern</option></select></label>
    <button type="button" disabled={!search && !status && !employmentType} onClick={onClear} className="h-10 px-3 text-left text-sm font-medium text-slate-600 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 sm:text-center">Clear filters</button>
  </div>;
}
