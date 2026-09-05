import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function PayrollHeader({
  title,
  subtitle,
  breadcrumbs = [],
  actions = null,
}) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200/80 pb-4">
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center text-xs text-gray-500 font-medium mb-1.5 space-x-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-semibold">{crumb.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
