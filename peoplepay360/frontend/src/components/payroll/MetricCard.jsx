import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = null,
  variant = "default",
}) {
  const variantStyles = {
    default: "bg-white border-gray-200 text-gray-900",
    primary: "bg-blue-50/70 border-blue-200 text-blue-900",
    success: "bg-emerald-50/70 border-emerald-200 text-emerald-900",
  };

  const iconBgStyles = {
    default: "bg-gray-100 text-gray-700",
    primary: "bg-blue-600 text-white",
    success: "bg-emerald-600 text-white",
  };

  return (
    <div
      className={`p-5 rounded-xl border shadow-xs transition-all hover:shadow-md ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              {value}
            </span>
            {trend && (
              <span
                className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                  trend.isPositive
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2 font-medium leading-normal">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl shadow-xs shrink-0 ${iconBgStyles[variant]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
