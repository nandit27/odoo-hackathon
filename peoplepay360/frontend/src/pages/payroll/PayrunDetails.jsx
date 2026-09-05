import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calculator,
  CheckCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  ArrowLeft,
  Eye,
  Info,
  Check,
} from "lucide-react";
import { usePayroll } from "../../context/PayrollContext";
import PayrollHeader from "../../components/payroll/PayrollHeader";
import StatusBadge from "../../components/payroll/StatusBadge";
import ConfirmationModal from "../../components/payroll/ConfirmationModal";
import { formatINR } from "../../utils/payrollCalculations";

export default function PayrunDetails() {
  const { id } = useParams();
  const {
    payruns,
    payslips,
    employees,
    computePayrun,
    validatePayrun,
    markPayrunPaid,
  } = usePayroll();

  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);

  const payrun = payruns.find((p) => p.id === id);
  const payrunPayslips = payslips.filter((ps) => ps.payrunId === id);

  if (!payrun) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Payroll Run Not Found</h2>
        <p className="text-xs text-gray-500 mt-1 mb-4">
          The requested payroll run ID "{id}" does not exist in local records.
        </p>
        <Link
          to="/payroll/payruns"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Payroll Runs</span>
        </Link>
      </div>
    );
  }

  // State Machine Handlers
  const handleCompute = () => {
    computePayrun(payrun.id);
  };

  const handleValidate = () => {
    validatePayrun(payrun.id);
  };

  const handleConfirmMarkPaid = () => {
    markPayrunPaid(payrun.id);
    setIsMarkPaidModalOpen(false);
  };

  const workflowSteps = [
    { key: "Draft", label: "1. Draft Setup", desc: "Select staff" },
    { key: "Computed", label: "2. Calculate Salaries", desc: "Evaluate rules" },
    { key: "Validated", label: "3. Approve Payroll", desc: "Audit & verify" },
    { key: "Paid", label: "4. Mark as Paid", desc: "Disburse pay" },
  ];

  const getStepStatus = (stepKey) => {
    const order = ["Draft", "Computed", "Validated", "Paid"];
    const currentIndex = order.indexOf(payrun.status);
    const targetIndex = order.indexOf(stepKey);
    if (targetIndex < currentIndex) return "completed";
    if (targetIndex === currentIndex) return "current";
    return "upcoming";
  };

  const participatingEmployees = (payrun.employeeIds || [])
    .map((empId) => employees.find((e) => e.id === empId))
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PayrollHeader
        title={payrun.name}
        subtitle={`Pay Period: ${payrun.period} · ${participatingEmployees.length} Enrolled Employees`}
        breadcrumbs={[
          { label: "Payroll", to: "/payroll/dashboard" },
          { label: "Payroll Runs", to: "/payroll/payruns" },
          { label: payrun.id },
        ]}
      />

      {/* Horizontal Lifecycle Step Visualizer */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {workflowSteps.map((ws, i) => {
            const st = getStepStatus(ws.key);
            return (
              <React.Fragment key={ws.key}>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                      st === "completed"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : st === "current"
                        ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {st === "completed" ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <div>
                    <span
                      className={`text-xs block font-bold ${
                        st === "current"
                          ? "text-blue-700 font-extrabold"
                          : st === "completed"
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {ws.label}
                    </span>
                    <span className="text-[10px] text-gray-400 block">{ws.desc}</span>
                  </div>
                </div>
                {i < workflowSteps.length - 1 && (
                  <div className="hidden sm:block flex-1 h-0.5 mx-3 bg-gray-200" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Prominent Next Action Banner */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
            Next Recommended Step
          </span>

          {payrun.status === "Draft" && (
            <div>
              <h3 className="text-base font-bold text-gray-900">Calculate Employee Salaries</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Calculate earnings, allowances, and statutory deductions for all {participatingEmployees.length} enrolled employees.
              </p>
            </div>
          )}

          {payrun.status === "Computed" && (
            <div>
              <h3 className="text-base font-bold text-gray-900">Approve Payroll Calculations</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Review computed salary slips below and approve this payroll run for bank disbursement.
              </p>
            </div>
          )}

          {payrun.status === "Validated" && (
            <div>
              <h3 className="text-base font-bold text-gray-900">Disburse & Mark as Paid</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Confirm salary payments have been initiated and mark all payslips as paid.
              </p>
            </div>
          )}

          {payrun.status === "Paid" && (
            <div>
              <h3 className="text-base font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Payroll Disbursed & Completed</span>
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                All employee salaries have been marked as paid. Payslips are available for download.
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          {payrun.status === "Draft" && (
            <button
              onClick={handleCompute}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate Salaries</span>
            </button>
          )}

          {payrun.status === "Computed" && (
            <button
              onClick={handleValidate}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Approve Payroll</span>
            </button>
          )}

          {payrun.status === "Validated" && (
            <button
              onClick={() => setIsMarkPaidModalOpen(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <CreditCard className="w-4 h-4" />
              <span>Mark as Paid</span>
            </button>
          )}

          {payrun.status === "Paid" && (
            <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Paid & Locked</span>
            </span>
          )}
        </div>
      </div>

      {/* Payrun Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Payroll Period
          </span>
          <div className="text-base font-bold text-gray-900 mt-1">{payrun.period}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {payrun.startDate} to {payrun.endDate}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Total Gross Earnings
          </span>
          <div className="text-xl font-bold text-gray-900 mt-1">
            {payrun.status === "Draft" ? "Pending calculation" : formatINR(payrun.totalGross)}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {participatingEmployees.length} Enrolled Employees
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Tax & Deductions
          </span>
          <div className="text-xl font-bold text-rose-600 mt-1">
            {payrun.status === "Draft" ? "Pending calculation" : `- ${formatINR(payrun.totalDeductions)}`}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Provident fund, tax, TDS</div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
            Total Take-Home Pay
          </span>
          <div className="text-xl font-extrabold text-blue-950 mt-1">
            {payrun.status === "Draft" ? "Pending calculation" : formatINR(payrun.totalNet)}
          </div>
          <div className="text-xs text-blue-700 mt-0.5 font-medium">
            Stage: <StatusBadge status={payrun.status} size="sm" />
          </div>
        </div>
      </div>

      {/* Payslips / Employee Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              {payrun.status === "Draft"
                ? `Enrolled Employee Contracts (${participatingEmployees.length})`
                : `Calculated Salary Slips (${payrunPayslips.length})`}
            </h3>
            <p className="text-xs text-gray-500">
              {payrun.status === "Draft"
                ? "Employee contracts enrolled for calculation in this batch."
                : "Individual salary rule breakdowns calculated for each worker."}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5">Employee Name</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Salary Structure</th>
                <th className="px-5 py-3.5">Gross Pay</th>
                <th className="px-5 py-3.5">Deductions</th>
                <th className="px-5 py-3.5">Take-Home Pay</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {payrun.status === "Draft"
                ? participatingEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900">{emp.name}</div>
                        <span className="text-[11px] text-gray-500">
                          {emp.employeeId} · {emp.position}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-800">{emp.department}</td>
                      <td className="px-5 py-3.5 font-medium text-blue-700">
                        {emp.salaryStructure}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 italic">Pending calculation</td>
                      <td className="px-5 py-3.5 text-gray-400 italic">Pending calculation</td>
                      <td className="px-5 py-3.5 text-gray-400 italic">Pending calculation</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status="Draft" size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-right text-gray-400 font-medium">
                        <span>Draft</span>
                      </td>
                    </tr>
                  ))
                : payrunPayslips.map((ps) => (
                    <tr key={ps.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link
                          to={`/payroll/payslips/${ps.id}`}
                          className="font-bold text-gray-900 hover:text-blue-600 block"
                        >
                          {ps.employeeName}
                        </Link>
                        <span className="text-[11px] text-gray-500">
                          {ps.employeeCode} · {ps.position}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-800">{ps.department}</td>
                      <td className="px-5 py-3.5 text-blue-700 font-semibold">
                        {ps.structureName}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-900">{formatINR(ps.gross)}</td>
                      <td className="px-5 py-3.5 text-rose-600 font-medium">
                        - {formatINR(ps.totalDeductions)}
                      </td>
                      <td className="px-5 py-3.5 font-extrabold text-gray-900">{formatINR(ps.net)}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={ps.status} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/payroll/payslips/${ps.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Payslip</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isMarkPaidModalOpen}
        title="Confirm Salary Payment Disbursement"
        message={`Are you sure you want to mark Payroll Run "${payrun.name}" as Paid? This will confirm take-home salary disbursement of ${formatINR(payrun.totalNet)} to ${payrunPayslips.length} employee bank accounts and lock the payroll batch.`}
        confirmText="Yes, Mark as Paid"
        cancelText="Cancel"
        variant="success"
        onConfirm={handleConfirmMarkPaid}
        onCancel={() => setIsMarkPaidModalOpen(false)}
        details={
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span>Payroll Period:</span>
              <span className="font-bold text-gray-900">{payrun.period}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Take-Home Pay:</span>
              <span className="font-bold text-emerald-700">{formatINR(payrun.totalNet)}</span>
            </div>
            <div className="flex justify-between">
              <span>Staff to Receive Pay:</span>
              <span className="font-bold text-gray-900">{payrunPayslips.length} Employees</span>
            </div>
          </div>
        }
      />
    </div>
  );
}
