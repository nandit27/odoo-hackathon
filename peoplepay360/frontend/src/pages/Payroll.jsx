import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PayrollNavigation from "../components/payroll/PayrollNavigation";
import Toast from "../components/payroll/Toast";

// Payroll Pages
import PayrollDashboard from "./payroll/PayrollDashboard";
import Payruns from "./payroll/Payruns";
import NewPayrun from "./payroll/NewPayrun";
import PayrunDetails from "./payroll/PayrunDetails";
import Payslips from "./payroll/Payslips";
import PayslipDetails from "./payroll/PayslipDetails";
import SalaryStructures from "./payroll/SalaryStructures";
import SalaryStructureDetails from "./payroll/SalaryStructureDetails";
import SalaryRules from "./payroll/SalaryRules";
import SalaryRuleDetails from "./payroll/SalaryRuleDetails";

export default function Payroll() {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-65px)] -m-4 flex flex-col lg:flex-row">
      {/* Vertical Sidebar Navigation */}
      <PayrollNavigation />

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full overflow-x-hidden">
        <Routes>
          {/* Index redirects to dashboard */}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PayrollDashboard />} />

          {/* Payrun Routes */}
          <Route path="payruns" element={<Payruns />} />
          <Route path="payruns/new" element={<NewPayrun />} />
          <Route path="payruns/:id" element={<PayrunDetails />} />

          {/* Payslip Routes */}
          <Route path="payslips" element={<Payslips />} />
          <Route path="payslips/:id" element={<PayslipDetails />} />

          {/* Salary Structure Routes */}
          <Route path="structures" element={<SalaryStructures />} />
          <Route path="structures/:id" element={<SalaryStructureDetails />} />

          {/* Salary Rule Routes */}
          <Route path="rules" element={<SalaryRules />} />
          <Route path="rules/:id" element={<SalaryRuleDetails />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>

      {/* Toast Feedback */}
      <Toast />
    </div>
  );
}
