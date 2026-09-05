import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Filter,
  Plus,
  ArrowRight,
  TrendingUp,
  Wallet,
  FileText,
  Calendar,
  ShieldCheck,
  Building2,
  ArrowUpRight,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { usePayroll } from "../../context/PayrollContext";
import PayrollHeader from "../../components/payroll/PayrollHeader";
import MetricCard from "../../components/payroll/MetricCard";
import StatusBadge from "../../components/payroll/StatusBadge";
import { formatINR, formatCompactINR } from "../../utils/payrollCalculations";

export default function PayrollDashboard() {
  const { payruns, payslips, employees, dashboardStats } = usePayroll();

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState("All Periods");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("All Types");

  // Dynamic calculations from context state
  const totalPaidPayruns = payruns.filter((p) => p.status === "Paid");
  const totalSalaryPaid = totalPaidPayruns.reduce((sum, p) => sum + p.totalNet, 0);

  const totalPayslipsGenerated = payslips.length;

  const avgSalary =
    employees.length > 0
      ? employees.reduce((sum, e) => sum + e.monthlySalary, 0) / employees.length
      : 0;

  // Department cost calculation dynamically from employees
  const departmentCosts = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      const dept = emp.department || "Other";
      if (!map[dept]) {
        map[dept] = { department: dept, employees: 0, totalCost: 0 };
      }
      map[dept].employees += 1;
      map[dept].totalCost += emp.monthlySalary;
    });

    return Object.values(map).map((item) => ({
      ...item,
      avgSalary: Math.round(item.totalCost / item.employees),
    }));
  }, [employees]);

  // Payslip distribution
  const statusCounts = useMemo(() => {
    const counts = { Draft: 0, Computed: 0, Validated: 0, Paid: 0 };
    payslips.forEach((ps) => {
      if (counts[ps.status] !== undefined) {
        counts[ps.status] += 1;
      } else {
        counts.Draft += 1;
      }
    });
    return [
      { name: "Paid", label: "Paid to Employees", value: counts.Paid, color: "#10b981" },
      { name: "Validated", label: "Approved (Ready to Pay)", value: counts.Validated, color: "#f59e0b" },
      { name: "Computed", label: "Calculated (Pending Review)", value: counts.Computed, color: "#3b82f6" },
      { name: "Draft", label: "Draft Setup", value: counts.Draft, color: "#9ca3af" },
    ];
  }, [payslips]);

  // Friendly human alerts
  const friendlyAlerts = [
    {
      id: "ALT-1",
      type: "warning",
      title: "Contract Renewal Alert",
      message: "Devendra Soni's consultant retainer contract expires in 28 days (October 1, 2026).",
      action: "Review Contract",
    },
    {
      id: "ALT-2",
      type: "info",
      title: "Payroll Ready for Payment",
      message: "September 2026 Payroll Run is approved and waiting for bank transfer release.",
      action: "View Payrun",
      link: "/payroll/payruns",
    },
    {
      id: "ALT-3",
      type: "success",
      title: "Bank Accounts & Tax IDs Verified",
      message: "All 10 active employees have verified bank account and PAN details on file.",
    },
    {
      id: "ALT-4",
      type: "success",
      title: "Statutory Tax & PF Compliance",
      message: "Provident Fund (12%) and Professional Tax deductions are synced for current quarter.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PayrollHeader
        title="Payroll Overview"
        subtitle="Monitor salary payments, payslips, and payroll activity in one place."
        breadcrumbs={[{ label: "Payroll", to: "/payroll/dashboard" }, { label: "Overview" }]}
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

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter overview:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option>All Periods</option>
            <option>September 2026</option>
            <option>August 2026</option>
            <option>July 2026</option>
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Sales</option>
            <option>Finance</option>
            <option>HR</option>
            <option>Support</option>
          </select>

          <select
            value={selectedEmployeeType}
            onChange={(e) => setSelectedEmployeeType(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option>All Employment Types</option>
            <option>Full-Time Regular</option>
            <option>Executive</option>
            <option>Contract Retainer</option>
          </select>
        </div>
      </div>

      {/* Top 5 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Salary Paid"
          value={formatCompactINR(totalSalaryPaid || 1840000)}
          subtitle="Total payments completed this period"
          icon={Wallet}
          variant="primary"
          trend={{ value: "+8.5%", isPositive: true }}
        />
        <MetricCard
          title="Payslips Generated"
          value={totalPayslipsGenerated}
          subtitle="Salary slips across all payroll runs"
          icon={FileText}
          variant="default"
        />
        <MetricCard
          title="Average Monthly Salary"
          value={formatINR(avgSalary)}
          subtitle="Average gross pay per employee"
          icon={TrendingUp}
          variant="default"
        />
        <MetricCard
          title="Approved Time Off"
          value={`${dashboardStats.timeOffOverview.paidTimeOff + dashboardStats.timeOffOverview.sickLeave} Days`}
          subtitle="Total leave days approved"
          icon={Calendar}
          variant="default"
        />
        <MetricCard
          title="Attendance Health"
          value={`${dashboardStats.attendanceOverview.present}%`}
          subtitle="Employees present on schedule"
          icon={ShieldCheck}
          variant="success"
          trend={{ value: "+2.1%", isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Salary Cost by Department */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Salary Cost by Department
              </h3>
              <p className="text-xs text-gray-500">
                See which departments have the highest monthly payroll cost.
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
              Monthly Total
            </span>
          </div>
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentCosts}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="department" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [formatINR(value), "Monthly Payroll Cost"]}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="totalCost" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Net Salary Trend */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Monthly Net Salary Trend
              </h3>
              <p className="text-xs text-gray-500">
                Track take-home salary disbursements over the last 6 months.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-medium text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Take-Home Pay
              </span>
              <span className="flex items-center gap-1 font-medium text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Tax & Deductions
              </span>
            </div>
          </div>
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dashboardStats.monthlyTrends}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatINR(value),
                    name === "net" ? "Take-Home Pay" : "Tax & Deductions",
                  ]}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#2563eb" }}
                />
                <Line
                  type="monotone"
                  dataKey="deductions"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "#f43f5e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payslip Status & Human-Friendly Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payslip Status Breakdown */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Payslip Status Breakdown
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Current stage of all {payslips.length} employee salary slips
          </p>

          <div className="flex items-center justify-between">
            <div className="h-44 w-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-gray-900">{payslips.length}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Total Slips</span>
              </div>
            </div>

            <div className="space-y-2.5 flex-1 pl-4">
              {statusCounts.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-gray-700 font-medium">{s.label}</span>
                  </span>
                  <span className="font-bold text-gray-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Human-Friendly Alerts */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Payroll & Compliance Updates</h3>
              <p className="text-xs text-gray-500">Items requiring HR review or verification</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md">
              4 Active
            </span>
          </div>

          <div className="space-y-2.5">
            {friendlyAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                  alert.type === "warning"
                    ? "bg-amber-50/70 border-amber-200 text-amber-900"
                    : alert.type === "info"
                    ? "bg-blue-50/70 border-blue-200 text-blue-900"
                    : "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {alert.type === "warning" ? (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : alert.type === "info" ? (
                    <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block text-gray-900">{alert.title}</span>
                    <span className="text-gray-600 mt-0.5 block leading-relaxed">{alert.message}</span>
                  </div>
                </div>

                {alert.action && alert.link && (
                  <Link
                    to={alert.link}
                    className="shrink-0 text-xs font-bold text-blue-700 hover:text-blue-900 underline mt-0.5"
                  >
                    {alert.action}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Grid: Attendance, Time Off, Contributing Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Attendance Summary</h3>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mb-4">Employee punctuality and presence rate</p>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="block text-xl font-bold text-emerald-700">
                {dashboardStats.attendanceOverview.present}%
              </span>
              <span className="text-xs text-emerald-600 font-medium">On Schedule</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <span className="block text-xl font-bold text-amber-700">
                {dashboardStats.attendanceOverview.late}%
              </span>
              <span className="text-xs text-amber-600 font-medium">Late Check-ins</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
              <span className="block text-xl font-bold text-rose-700">
                {dashboardStats.attendanceOverview.absent}%
              </span>
              <span className="text-xs text-rose-600 font-medium">Absent</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <span className="block text-xl font-bold text-blue-700">
                {dashboardStats.attendanceOverview.overtimeHours} hrs
              </span>
              <span className="text-xs text-blue-600 font-medium">Total Overtime</span>
            </div>
          </div>
        </div>

        {/* Time Off Summary */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Approved Leave & Time Off</h3>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mb-4">Leave days deducted from monthly working hours</p>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="block text-xl font-bold text-gray-900">
                {dashboardStats.timeOffOverview.paidTimeOff}
              </span>
              <span className="text-xs text-gray-500 font-medium">Paid Leaves</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="block text-xl font-bold text-gray-900">
                {dashboardStats.timeOffOverview.sickLeave}
              </span>
              <span className="text-xs text-gray-500 font-medium">Sick Leaves</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="block text-xl font-bold text-gray-900">
                {dashboardStats.timeOffOverview.compOff}
              </span>
              <span className="text-xs text-gray-500 font-medium">Comp Offs</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span className="block text-xl font-bold text-amber-700">
                {dashboardStats.timeOffOverview.pendingRequests}
              </span>
              <span className="text-xs text-amber-600 font-medium">Pending Leaves</span>
            </div>
          </div>
        </div>

        {/* Connected Data Sources */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Data Sources Connected</h3>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mb-4">Modules automatically feeding into Payroll</p>
          <div className="space-y-2 text-xs">
            {[
              { name: "Active Employee Contracts", count: `${employees.length} Records` },
              { name: "Attendance & Time Logs", count: "Synced" },
              { name: "Approved Leave Records", count: "34 Days" },
              { name: "Configured Salary Rules", count: "9 Rules" },
              { name: "Historical Payroll Runs", count: `${payruns.length} Batches` },
            ].map((m) => (
              <div key={m.name} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className="font-semibold text-gray-700">{m.name}</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                  {m.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Summary Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">Department Compensation Breakdown</h3>
            <p className="text-xs text-gray-500">Summary of employee count and monthly compensation cost by team</p>
          </div>
          <Link
            to="/payroll/payruns"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Payroll Runs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Team Members</th>
                <th className="px-5 py-3">Average Monthly Salary</th>
                <th className="px-5 py-3">Total Department Payroll</th>
                <th className="px-5 py-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {departmentCosts.map((dept) => (
                <tr key={dept.department} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>{dept.department}</span>
                  </td>
                  <td className="px-5 py-3.5 font-medium">{dept.employees} Employees</td>
                  <td className="px-5 py-3.5">{formatINR(dept.avgSalary)}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">
                    {formatINR(dept.totalCost)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to="/payroll/payslips"
                      className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5"
                    >
                      <span>View Payslips</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
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
