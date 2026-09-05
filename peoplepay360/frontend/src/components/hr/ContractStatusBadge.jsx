const styles = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Draft: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Expired: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Cancelled: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export default function ContractStatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status] || styles.Cancelled}`}>{status}</span>;
}
