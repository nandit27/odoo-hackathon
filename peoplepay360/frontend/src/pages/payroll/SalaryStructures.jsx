import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ArrowRight, Layers, Sliders, Check } from "lucide-react";
import { usePayroll } from "../../context/PayrollContext";
import PayrollHeader from "../../components/payroll/PayrollHeader";
import StatusBadge from "../../components/payroll/StatusBadge";

export default function SalaryStructures() {
  const { structures, rules } = usePayroll();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredStructures = structures.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.type.toLowerCase().includes(search.toLowerCase()) ||
      st.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || st.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PayrollHeader
        title="Salary Structures"
        subtitle="Salary structures define how an employee's total compensation and take-home pay are calculated."
        breadcrumbs={[
          { label: "Payroll", to: "/payroll/dashboard" },
          { label: "Salary Structures" },
        ]}
        actions={
          <Link
            to="/payroll/structures/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Salary Structure</span>
          </Link>
        }
      />

      {/* Structure Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {structures.map((st) => {
          const structureRules = (st.ruleIds || [])
            .map((rId) => rules.find((r) => r.id === rId))
            .filter(Boolean);

          return (
            <div
              key={st.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{st.name}</h3>
                    <span className="text-xs text-blue-700 font-semibold">{st.type}</span>
                  </div>
                  <StatusBadge status={st.status || "Active"} size="sm" />
                </div>

                <p className="text-xs text-gray-600 mt-2.5 leading-relaxed">
                  {st.description}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Included Components ({structureRules.length}):
                  </span>
                  <div className="space-y-1 text-xs">
                    {structureRules.slice(0, 4).map((r) => (
                      <div key={r.id} className="flex items-center gap-1.5 text-gray-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{r.name}</span>
                      </div>
                    ))}
                    {structureRules.length > 4 && (
                      <div className="text-[11px] text-gray-500 font-medium pl-5">
                        + {structureRules.length - 4} more rules
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
                <Link
                  to={`/payroll/structures/${st.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  <span>Configure Rules Sequence</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Salary Structures Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden mt-6">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">All Salary Structure Templates</h3>
            <p className="text-xs text-gray-500">Overview of compensation templates assigned to staff</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5">Structure Name</th>
                <th className="px-5 py-3.5">Contract Type</th>
                <th className="px-5 py-3.5">Assigned Rules</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredStructures.map((st) => (
                <tr
                  key={st.id}
                  className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/payroll/structures/${st.id}`}
                      className="font-bold text-gray-900 group-hover:text-blue-600 block text-sm"
                    >
                      {st.name}
                    </Link>
                    <span className="text-[11px] text-gray-400 font-mono">{st.id}</span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{st.type}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
                      <Sliders className="w-3 h-3" />
                      {st.ruleIds?.length || 0} Rules
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-xs truncate">
                    {st.description}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={st.status || "Active"} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to={`/payroll/structures/${st.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                    >
                      <span>Configure</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
