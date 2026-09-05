import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ArrowRight, RotateCcw } from "lucide-react";
import { usePayroll } from "../../context/PayrollContext";
import PayrollHeader from "../../components/payroll/PayrollHeader";
import StatusBadge from "../../components/payroll/StatusBadge";
import { formatINR } from "../../utils/payrollCalculations";

export default function SalaryRules() {
  const { rules } = usePayroll();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoryLabels = {
    Basic: { emoji: "💰", label: "Base Salary", bg: "bg-blue-50 text-blue-700 border-blue-200" },
    Allowance: { emoji: "🏠", label: "Allowance", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    Deduction: { emoji: "➖", label: "Deduction", bg: "bg-rose-50 text-rose-700 border-rose-200" },
    Computation: { emoji: "🧮", label: "Calculation", bg: "bg-purple-50 text-purple-700 border-purple-200" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PayrollHeader
        title="Salary Rules"
        subtitle="Configure how each part of an employee's salary is calculated (earnings, allowances, tax, and deductions)."
        breadcrumbs={[
          { label: "Payroll", to: "/payroll/dashboard" },
          { label: "Salary Rules" },
        ]}
        actions={
          <Link
            to="/payroll/rules/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Salary Rule</span>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search rule name or code (e.g. HRA, Basic)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg px-3 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Basic">💰 Base Salary</option>
            <option value="Allowance">🏠 Allowances</option>
            <option value="Deduction">➖ Deductions & Taxes</option>
            <option value="Computation">🧮 Calculations</option>
          </select>
        </div>
      </div>

      {/* Salary Rules Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredRules.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-base font-bold text-gray-900">No Salary Rules Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search query or create a new salary rule.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Rule Name</th>
                  <th className="px-5 py-3.5">Short Code</th>
                  <th className="px-5 py-3.5">Component Category</th>
                  <th className="px-5 py-3.5">Calculation Method</th>
                  <th className="px-5 py-3.5">Formula / Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredRules.map((rule) => {
                  const cat = categoryLabels[rule.category] || {
                    emoji: "📋",
                    label: rule.category,
                    bg: "bg-gray-100 text-gray-700",
                  };

                  return (
                    <tr
                      key={rule.id}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          to={`/payroll/rules/${rule.id}`}
                          className="font-bold text-gray-900 group-hover:text-blue-600 block text-sm"
                        >
                          {rule.name}
                        </Link>
                        <span className="text-[11px] text-gray-500">{rule.description}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {rule.code}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cat.bg}`}
                        >
                          {cat.emoji} {cat.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-800 capitalize">
                        {rule.calcType === "fixed"
                          ? "Fixed Amount"
                          : rule.calcType === "percentage"
                          ? "Percentage Rate"
                          : "Formula Expression"}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-gray-800 font-semibold">
                        {rule.calcType === "fixed"
                          ? formatINR(rule.amount)
                          : rule.calcType === "percentage"
                          ? `${rule.percentage}% of ${rule.basedOn}`
                          : rule.formula}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={rule.status || "Active"} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/payroll/rules/${rule.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                        >
                          <span>Edit Rule</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
