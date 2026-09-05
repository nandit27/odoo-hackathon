const styles = { Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", "On Leave": "bg-amber-50 text-amber-700 ring-amber-600/20", Inactive: "bg-slate-100 text-slate-600 ring-slate-500/20" };
export default function StatusBadge({ status }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status] || styles.Inactive}`}>{status}</span>;
}
