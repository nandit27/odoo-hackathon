import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  Printer,
  Download,
  ArrowLeft,
  CreditCard,
  AlertCircle,
  Building,
} from "lucide-react";
import { usePayroll } from "../../context/PayrollContext";
import PayrollHeader from "../../components/payroll/PayrollHeader";
import StatusBadge from "../../components/payroll/StatusBadge";
import { formatINR } from "../../utils/payrollCalculations";

export default function PayslipDetails() {
  const { id } = useParams();
  const { payslips, showToast } = usePayroll();

  const payslip = payslips.find((ps) => ps.id === id);

  if (!payslip) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Payslip Record Not Found</h2>
        <p className="text-xs text-gray-500 mt-1 mb-4">
          The requested payslip ID "{id}" could not be located.
        </p>
        <Link
          to="/payroll/payslips"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Payslips List</span>
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    showToast(`Downloading official Payslip PDF for ${payslip.employeeName} (${payslip.period})...`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Header */}
      <div className="print:hidden">
        <PayrollHeader
          title={`Payslip / ${payslip.employeeName}`}
          subtitle={`Pay Period: ${payslip.period} · Payroll Batch: ${payslip.payrunName}`}
          breadcrumbs={[
            { label: "Payroll", to: "/payroll/dashboard" },
            { label: "Payslips", to: "/payroll/payslips" },
            { label: payslip.employeeName },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Payslip</span>
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Printable Payslip Statement */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Company Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-gray-900 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm">
                PP
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">PeoplePay360 Inc.</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enterprise HRMS & Automated Payroll
            </p>
            <p className="text-[11px] text-gray-400">
              Bangalore HQ · GSTIN: 29AAAAA0000A1Z5 · CIN: U72200KA2022PTC123456
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
              Official Salary Statement
            </span>
            <div className="text-base font-extrabold text-gray-900 mt-0.5">
              {payslip.period}
            </div>
            <div className="mt-1.5 flex items-center sm:justify-end gap-2">
              <span className="text-xs text-gray-500">Payment Status:</span>
              <StatusBadge status={payslip.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Employee Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-gray-200 text-xs">
          <div>
            <span className="text-gray-400 block font-medium">Employee Name</span>
            <span className="text-gray-900 font-bold text-sm block mt-0.5">
              {payslip.employeeName}
            </span>
            <span className="text-gray-500 text-[11px]">{payslip.position}</span>
          </div>

          <div>
            <span className="text-gray-400 block font-medium">Employee ID</span>
            <span className="text-gray-900 font-mono font-bold block mt-0.5">
              {payslip.employeeCode}
            </span>
            <span className="text-gray-500 text-[11px]">Department: {payslip.department}</span>
          </div>

          <div>
            <span className="text-gray-400 block font-medium">Pay Period Range</span>
            <span className="text-gray-900 font-semibold block mt-0.5">
              {payslip.startDate}
            </span>
            <span className="text-gray-500 text-[11px]">to {payslip.endDate}</span>
          </div>

          <div>
            <span className="text-gray-400 block font-medium">Salary Structure</span>
            <span className="text-blue-700 font-bold block mt-0.5">
              {payslip.structureName}
            </span>
            <span className="text-gray-500 text-[11px]">
              PAN: {payslip.panNumber || "ABCDE1234F"}
            </span>
          </div>
        </div>

        {/* Bank & Reference Banner */}
        <div className="bg-gray-50 rounded-xl p-3.5 my-5 border border-gray-200 flex flex-wrap items-center justify-between text-xs text-gray-700 gap-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <span>
              <strong>Bank Account:</strong> {payslip.bankAccount || "HDFC Bank - 501004329810"}
            </span>
          </div>
          <div>
            <span>
              <strong>Payslip Number:</strong> <span className="font-mono font-bold text-gray-900">{payslip.id}</span>
            </span>
          </div>
        </div>

        {/* Earnings & Deductions Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* EARNINGS */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Earnings (Allowances)
              </h3>
              <span className="text-xs font-bold text-emerald-800">Amount</span>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between text-gray-700">
                <span>Basic Salary (Base Pay)</span>
                <span className="font-semibold text-gray-900">{formatINR(payslip.basic)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>House Rent Allowance (HRA)</span>
                <span className="font-semibold text-gray-900">{formatINR(payslip.hra)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Meal Allowance</span>
                <span className="font-semibold text-gray-900">{formatINR(payslip.meal)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Transport Allowance</span>
                <span className="font-semibold text-gray-900">{formatINR(payslip.transport)}</span>
              </div>
              {payslip.otherAllowances > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Executive / Special Allowance</span>
                  <span className="font-semibold text-gray-900">
                    {formatINR(payslip.otherAllowances)}
                  </span>
                </div>
              )}
            </div>
            <div className="bg-emerald-50/70 px-4 py-3 border-t border-emerald-100 flex justify-between font-bold text-xs text-emerald-950">
              <span>TOTAL GROSS EARNINGS (A)</span>
              <span className="text-sm font-extrabold">{formatINR(payslip.gross)}</span>
            </div>
          </div>

          {/* DEDUCTIONS */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-rose-50 px-4 py-3 border-b border-rose-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                Statutory Deductions & Taxes
              </h3>
              <span className="text-xs font-bold text-rose-800">Amount</span>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between text-gray-700">
                <span>Provident Fund (PF - 12%)</span>
                <span className="font-semibold text-gray-900">{formatINR(payslip.pf)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Professional Tax (PT)</span>
                <span className="font-semibold text-gray-900">{formatINR(payslip.pt)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Income Tax (TDS Withholding)</span>
                <span className="font-semibold text-gray-900">{formatINR(payslip.tds)}</span>
              </div>
              {payslip.otherDeductions > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Other Deductions</span>
                  <span className="font-semibold text-gray-900">
                    {formatINR(payslip.otherDeductions)}
                  </span>
                </div>
              )}
            </div>
            <div className="bg-rose-50/70 px-4 py-3 border-t border-rose-100 flex justify-between font-bold text-xs text-rose-950">
              <span>TOTAL DEDUCTIONS (B)</span>
              <span className="text-sm font-extrabold">{formatINR(payslip.totalDeductions)}</span>
            </div>
          </div>
        </div>

        {/* HIGH IMPACT PROMINENT TAKE-HOME PAY BOX */}
        <div className="bg-blue-50/90 border-2 border-blue-600 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 my-6 shadow-xs">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-800">
              TAKE-HOME SALARY (A − B)
            </span>
            <p className="text-xs text-blue-700 mt-1">
              Amount the employee receives in their bank account after all deductions.
            </p>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-3xl sm:text-4xl font-black text-blue-950 block tracking-tight">
              {formatINR(payslip.net)}
            </span>
            <span className="text-xs font-semibold text-blue-700">
              Net Payable Indian Rupees
            </span>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-12 pt-6 border-t border-gray-200 grid grid-cols-2 gap-8 text-xs text-gray-500">
          <div>
            <div className="h-10 border-b border-gray-300 w-48 mb-2" />
            <p className="font-bold text-gray-800">Employer Authorized Signatory</p>
            <p className="text-[11px]">PeoplePay360 Payroll Department</p>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="h-10 border-b border-gray-300 w-48 mb-2" />
            <p className="font-bold text-gray-800">Employee Signature</p>
            <p className="text-[11px]">Received and Acknowledged</p>
          </div>
        </div>
      </div>
    </div>
  );
}
