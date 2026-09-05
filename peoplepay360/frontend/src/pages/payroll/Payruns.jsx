import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Calendar, Users, ArrowRight, RotateCcw, HelpCircle } from "lucide-react";
import { usePayroll } from "../../context/PayrollContext";
import PayrollHeader from "../../components/payroll/PayrollHeader";
import StatusBadge from "../../components/payroll/StatusBadge";
import { formatINR } from "../../utils/payrollCalculations";

export default function Payruns() {
  const { payruns } = usePayroll();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("All");

  const filteredPayruns = payruns.filter((pr) => {
    const matchesSearch =
      pr.name.toLowerCase().includes(search.toLowerCase()) ||
      pr.period.toLowerCase().includes(search.toLowerCase()) ||
      pr.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || pr.status === statusFilter;
    const matchesPeriod = periodFilter === "All" || pr.period === periodFilter;

    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const uniquePeriods = Array.from(new Set(payruns.map((p) => p.period)));

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPeriodFilter("All");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PayrollHeader
        title="Payroll Runs"
        subtitle="Create and manage salary payments for your employees across each pay period."
        breadcrumbs={[{ label: "Payroll", to: "/payroll/dashboard" }, { label: "Payroll Runs" }]}
        actions={
          <Link
            to="/payroll/payruns/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Payroll Run</span>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by payrun name, ID, or month..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg px-3 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft (Preparing)</option>
              <option value="Computed">Calculated (Ready)</option>
              <option value="Validated">Approved</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">Period:</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg px-3 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="All">All Periods</option>
              {uniquePeriods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {(search || statusFilter !== "All" || periodFilter !== "All") && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold ml-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Payrun Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredPayruns.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Payroll Runs Yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
              {search || statusFilter !== "All"
                ? "No payroll records match your current search and filter criteria."
                : "Create your first payroll run to start calculating salaries and generating payslips."}
            </p>
            <Link
              to="/payroll/payruns/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Payroll Run</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Payroll Name</th>
                  <th className="px-5 py-3.5">Pay Period</th>
                  <th className="px-5 py-3.5">Employees Included</th>
                  <th className="px-5 py-3.5">Total Take-Home Pay</th>
                  <th className="px-5 py-3.5">Current Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredPayruns.map((pr) => (
                  <tr
                    key={pr.id}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/payroll/payruns/${pr.id}`}
                        className="font-bold text-gray-900 group-hover:text-blue-600 text-sm block"
                      >
                        {pr.name}
                      </Link>
                      <span className="text-[11px] text-gray-400 font-mono">{pr.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{pr.period}</div>
                      <div className="text-[11px] text-gray-500">
                        {pr.startDate} to {pr.endDate}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 font-bold bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700">
                        <Users className="w-3.5 h-3.5 text-gray-500" />
                        <span>{pr.totalEmployees || pr.employeeIds.length} Employees</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-gray-900 text-sm">
                      {pr.status === "Draft" ? (
                        <span className="text-gray-400 font-normal italic text-xs">
                          Pending calculation
                        </span>
                      ) : (
                        formatINR(pr.totalNet)
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={pr.status} showDescription={false} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/payroll/payruns/${pr.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                      >
                        <span>Open Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
