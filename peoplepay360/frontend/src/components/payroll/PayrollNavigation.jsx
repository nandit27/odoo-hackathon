import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  FileText,
  Layers,
  Calculator,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { usePayroll } from "../../context/PayrollContext";

export default function PayrollNavigation() {
  const { payruns, payslips, resetPayrollData } = usePayroll();

  const navItems = [
    {
      label: "Dashboard",
      description: "Overview of your payroll",
      to: "/payroll/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "Payroll Runs",
      description: "Process employee salaries",
      to: "/payroll/payruns",
      icon: Wallet,
      badge: payruns.length,
    },
    {
      label: "Payslips",
      description: "View employee salary slips",
      to: "/payroll/payslips",
      icon: FileText,
      badge: payslips.length,
    },
    {
      label: "Salary Structures",
      description: "Define salary packages",
      to: "/payroll/structures",
      icon: Layers,
      badge: null,
    },
    {
      label: "Salary Rules",
      description: "Configure earnings & deductions",
      to: "/payroll/rules",
      icon: Calculator,
      badge: null,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-gray-200/80 p-4 sm:p-5 flex flex-col justify-between shrink-0 shadow-xs print:hidden">
      <div className="space-y-6">
        {/* Module Header Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-extrabold tracking-wider text-blue-600 uppercase">
              Module
            </span>
            <h2 className="text-sm font-bold text-gray-900">Payroll Management</h2>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            v1.0
          </span>
        </div>

        {/* Vertical Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-gray-700 hover:text-gray-950 hover:bg-gray-100"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-gray-500 group-hover:text-blue-600"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== null && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isActive
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Demo Reset Controls */}
      <div className="mt-8 pt-4 border-t border-gray-100 space-y-3">
        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive State</span>
          </div>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            All payruns, payslips, and rules are reactive and persist locally.
          </p>
        </div>

        <button
          onClick={resetPayrollData}
          title="Reset Payroll state to initial sample data"
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors border border-gray-200"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
          <span>Reset Sample Data</span>
        </button>
      </div>
    </aside>
  );
}
