const styles = {
  Present: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Late: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Absent: "bg-red-50 text-red-700 ring-red-600/20",
  "Missing Checkout": "bg-orange-50 text-orange-700 ring-orange-600/20",
  "On Leave": "bg-blue-50 text-blue-700 ring-blue-600/20",
};
export default function AttendanceStatusBadge({ status }) { return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status] || styles.Absent}`}>{status}</span>; }
