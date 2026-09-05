import React from "react";
import { Check, Clock, AlertTriangle, CheckCircle, FileEdit } from "lucide-react";

export default function StatusBadge({ status, size = "md", showDescription = false }) {
  const norm = (status || "draft").toLowerCase();

  const configs = {
    draft: {
      label: "Draft",
      desc: "Payroll is being prepared",
      bg: "bg-gray-100 text-gray-800 border-gray-300",
      dot: "bg-gray-400",
      icon: FileEdit,
    },
    computed: {
      label: "Calculated",
      desc: "Salary calculations are ready",
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
      icon: Clock,
    },
    validated: {
      label: "Approved",
      desc: "Payroll has been approved",
      bg: "bg-amber-50 text-amber-800 border-amber-300",
      dot: "bg-amber-500",
      icon: Check,
    },
    paid: {
      label: "Paid",
      desc: "Employees have been paid",
      bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
      dot: "bg-emerald-600",
      icon: CheckCircle,
    },
    warning: {
      label: "Action Needed",
      desc: "Requires attention",
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
      icon: AlertTriangle,
    },
    active: {
      label: "Active",
      desc: "In active use",
      bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
      dot: "bg-emerald-600",
      icon: CheckCircle,
    },
  };

  const config = configs[norm] || configs.draft;
  const Icon = config.icon;

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClass}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <span>{config.label}</span>
      </span>
      {showDescription && (
        <span className="text-xs text-gray-500 hidden sm:inline">
          ({config.desc})
        </span>
      )}
    </div>
  );
}
