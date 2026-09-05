import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, FileText, Eye, RotateCcw } from "lucide-react";
import { usePayroll } from "../../context/PayrollContext";
import PayrollHeader from "../../components/payroll/PayrollHeader";
import StatusBadge from "../../components/payroll/StatusBadge";
import { formatINR } from "../../utils/payrollCalculations";

export default function Payslips() {
  const { payslips } = usePayroll();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("All");

  const filteredPayslips = payslips.filter((ps) => {
    const matchesSearch =
      ps.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      ps.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      ps.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || ps.status === statusFilter;
    const matchesDept = deptFilter === "All" || ps.department === deptFilter;
    const matchesPeriod = periodFilter === "All" || ps.period === periodFilter;

    return matchesSearch && matchesStatus && matchesDept && matchesPeriod;
  });

  const uniquePeriods = Array.from(new Set(payslips.map((p) => p.period)));

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setDeptFilter("All");
    setPeriodFilter("All");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PayrollHeader
        title="Employee Payslips"
        subtitle="View, search, and download itemized salary slips and statutory deduction breakdowns."
        breadcrumbs={[{ label: "Payroll", to: "/payroll/dashboard" }, { label: "Payslips" }]}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee name, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Computed">Calculated</option>
              <option value="Validated">Approved</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          {/* Department */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-semibold">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
              <option value="Support">Support</option>
            </select>
          </div>

          {/* Period */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-semibold">Period:</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="All">All Periods</option>
              {uniquePeriods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {(search || statusFilter !== "All" || deptFilter !== "All" || periodFilter !== "All") && (
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

      {/* Payslips Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredPayslips.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Payslips Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
              No payslip records match your selected filters. Calculate a payroll run to generate salary slips.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Employee ID</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Pay Period</th>
                  <th className="px-5 py-3.5">Gross Pay</th>
                  <th className="px-5 py-3.5">Deductions</th>
                  <th className="px-5 py-3.5">Take-Home Pay</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredPayslips.map((ps) => (
                  <tr
                    key={ps.id}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/payroll/payslips/${ps.id}`}
                        className="font-bold text-gray-900 group-hover:text-blue-600 block"
                      >
                        {ps.employeeName}
                      </Link>
                      <span className="text-[11px] text-gray-500">{ps.position}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-gray-600">
                      {ps.employeeCode}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{ps.department}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-900">{ps.period}</div>
                      <div className="text-[10px] text-gray-500">{ps.payrunName}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {formatINR(ps.gross)}
                    </td>
                    <td className="px-5 py-3.5 text-rose-600 font-medium">
                      - {formatINR(ps.totalDeductions)}
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-gray-900">
                      {formatINR(ps.net)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={ps.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/payroll/payslips/${ps.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Slip</span>
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
