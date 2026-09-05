import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  Users,
  Search,
  AlertCircle,
  HelpCircle,
  Info,
} from "lucide-react";
import { usePayroll } from "../../context/PayrollContext";
import PayrollHeader from "../../components/payroll/PayrollHeader";
import { formatINR } from "../../utils/payrollCalculations";

export default function NewPayrun() {
  const navigate = useNavigate();
  const { employees, createPayrun } = usePayroll();

  // Multi-step State
  const [step, setStep] = useState(1);

  // Step 1: Scope & Dates
  const [name, setName] = useState(`October 2026 Monthly Payroll`);
  const [period, setPeriod] = useState("October 2026");
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2026-10-31");
  const [departmentScope, setDepartmentScope] = useState("All Departments");
  const [notes, setNotes] = useState("Regular monthly salary disbursement batch.");
  const [step1Errors, setStep1Errors] = useState({});

  // Step 2: Employee Selection
  const [searchEmp, setSearchEmp] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [selectedEmpIds, setSelectedEmpIds] = useState(
    employees.map((e) => e.id) // Default all selected
  );

  // Validate Step 1
  const handleContinueToStep2 = (e) => {
    e.preventDefault();
    const errors = {};

    if (!name.trim()) errors.name = "Please give this payroll run a name.";
    if (!startDate) errors.startDate = "Please select a start date.";
    if (!endDate) errors.endDate = "Please select an end date.";
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      errors.endDate = "The end date must be after the start date.";
    }

    if (Object.keys(errors).length > 0) {
      setStep1Errors(errors);
      return;
    }

    setStep1Errors({});
    setStep(2);
  };

  // Filtered employees in Step 2
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchEmp.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchEmp.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchEmp.toLowerCase());
    const matchesDept = deptFilter === "All" || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  // Toggle selection
  const handleToggleEmp = (id) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all visible / all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allFilteredIds = filteredEmployees.map((e) => e.id);
      setSelectedEmpIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    } else {
      const allFilteredIds = filteredEmployees.map((e) => e.id);
      setSelectedEmpIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    }
  };

  const isAllSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((e) => selectedEmpIds.includes(e.id));

  // Final Submit
  const handleCreatePayrun = async () => {
    if (selectedEmpIds.length === 0) return;

    const newPr = await createPayrun({
      name,
      period,
      startDate,
      endDate,
      departmentScope,
      selectedEmployeeIds: selectedEmpIds,
      notes,
    });

    navigate(`/payroll/payruns/${newPr.id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <PayrollHeader
        title="Create Payroll Run"
        subtitle="Follow two simple steps to set up a new payroll run and select participating employees."
        breadcrumbs={[
          { label: "Payroll", to: "/payroll/dashboard" },
          { label: "Payroll Runs", to: "/payroll/payruns" },
          { label: "New Payroll Run" },
        ]}
      />

      {/* Visual Stepper Wizard Indicator */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 1 ? "bg-blue-600 text-white shadow-xs" : "bg-gray-100 text-gray-500"
            }`}
          >
            1
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Step 1: Payroll Details</p>
            <p className="text-[11px] text-gray-500">Name and salary period dates</p>
          </div>
        </div>

        <div className="h-0.5 flex-1 mx-4 sm:mx-8 bg-gray-200" />

        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 2 ? "bg-blue-600 text-white shadow-xs" : "bg-gray-100 text-gray-500"
            }`}
          >
            2
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Step 2: Select Employees</p>
            <p className="text-[11px] text-gray-500">Choose staff to receive salaries</p>
          </div>
        </div>
      </div>

      {/* STEP 1 FORM */}
      {step === 1 && (
        <form
          onSubmit={handleContinueToStep2}
          className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6"
        >
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900">Payroll Information</h2>
            <p className="text-xs text-gray-500">
              Provide basic details for this salary processing cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Payrun Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Payroll Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. October 2026 Regular Payroll"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Give this payroll run a clear name so you can easily identify it later.
              </p>
              {step1Errors.name && (
                <p className="text-rose-600 text-xs mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {step1Errors.name}
                </p>
              )}
            </div>

            {/* Period */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Payroll Period <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. October 2026"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Choose the month or period for which salaries are being processed.
              </p>
            </div>

            {/* Department Scope */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Department / Scope
              </label>
              <select
                value={departmentScope}
                onChange={(e) => setDepartmentScope(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option>All Departments</option>
                <option>Engineering Only</option>
                <option>Sales & Marketing</option>
                <option>Finance & HR</option>
                <option>Customer Support</option>
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                Filter employees by department if processing separately.
              </p>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              {step1Errors.startDate && (
                <p className="text-rose-600 text-xs mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {step1Errors.startDate}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              {step1Errors.endDate && (
                <p className="text-rose-600 text-xs mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {step1Errors.endDate}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Notes & Reminders (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for payroll or finance records..."
                className="w-full text-xs sm:text-sm px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Link
              to="/payroll/payruns"
              className="text-xs font-bold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <span>Continue to Select Employees</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: SELECT EMPLOYEES */}
      {step === 2 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Select Employees</h2>
              <p className="text-xs text-gray-500">
                Choose the employees whose salaries should be included in this payroll run.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-extrabold text-blue-900">
                Selected: {selectedEmpIds.length} of {employees.length} Employees
              </span>
            </div>
          </div>

          {/* Search & Dept Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, role, or ID..."
                value={searchEmp}
                onChange={(e) => setSearchEmp(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
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
          </div>

          {/* Employee Selection Table */}
          <div className="border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3">Employee Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Joining Date</th>
                  <th className="px-4 py-3">Monthly Wage (CTC)</th>
                  <th className="px-4 py-3">Assigned Salary Structure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredEmployees.map((emp) => {
                  const isChecked = selectedEmpIds.includes(emp.id);
                  return (
                    <tr
                      key={emp.id}
                      onClick={() => handleToggleEmp(emp.id)}
                      className={`cursor-pointer transition-colors ${
                        isChecked ? "bg-blue-50/70" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleEmp(emp.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{emp.name}</div>
                        <div className="text-[11px] text-gray-500">
                          {emp.employeeId} · {emp.position}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{emp.department}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.joiningDate}</td>
                      <td className="px-4 py-3 font-extrabold text-gray-900">
                        {formatINR(emp.monthlySalary)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                          {emp.salaryStructure}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Validation Notice if 0 selected */}
          {selectedEmpIds.length === 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Please select at least 1 employee to create this payroll run.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Step 1</span>
            </button>

            <button
              type="button"
              disabled={selectedEmpIds.length === 0}
              onClick={handleCreatePayrun}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                selectedEmpIds.length === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Create Payroll Run ({selectedEmpIds.length} Employees)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
