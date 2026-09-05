import React, { createContext, useContext, useState, useEffect } from "react";
import {
  INITIAL_EMPLOYEES,
  INITIAL_SALARY_RULES,
  INITIAL_SALARY_STRUCTURES,
  INITIAL_PAYRUNS,
  MOCK_DASHBOARD_STATS,
} from "../data/payrollMockData";
import { calculateEmployeeSalary } from "../utils/payrollCalculations";

const STORAGE_KEY = "peoplepay360_payroll_v1";

/**
 * Safely compute initial seed payslips for pre-existing validated/paid initial mock payruns
 */
function generateSeedPayslips(payrunsList, employeesList, rulesList, structuresList) {
  const list = [];
  (payrunsList || []).forEach((pr) => {
    if (pr.status === "Draft") return;
    (pr.employeeIds || []).forEach((empId) => {
      const emp = (employeesList || []).find((e) => e.id === empId);
      if (!emp) return;
      const calc = calculateEmployeeSalary(emp, rulesList, structuresList);
      list.push({
        id: `PS-${pr.id}-${emp.id}`,
        payrunId: pr.id,
        payrunName: pr.name,
        period: pr.period,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeCode: emp.employeeId,
        department: emp.department,
        position: emp.position,
        startDate: pr.startDate,
        endDate: pr.endDate,
        status: pr.status,
        basic: calc.basic,
        hra: calc.hra,
        meal: calc.meal,
        transport: calc.transport,
        otherAllowances: calc.otherAllowances,
        gross: calc.gross,
        pf: calc.pf,
        pt: calc.pt,
        tds: calc.tds,
        otherDeductions: calc.otherDeductions,
        totalDeductions: calc.totalDeductions,
        net: calc.net,
        structureName: calc.structureName,
        ruleBreakdown: calc.ruleBreakdown,
        bankAccount: emp.bankAccount,
        panNumber: emp.panNumber,
        createdAt: new Date().toISOString(),
      });
    });
  });
  return list;
}

/**
 * Safely read and validate persisted payroll state from localStorage
 */
function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    // Validate structure arrays
    const employees = Array.isArray(parsed.employees) && parsed.employees.length > 0 ? parsed.employees : INITIAL_EMPLOYEES;
    const rules = Array.isArray(parsed.rules) && parsed.rules.length > 0 ? parsed.rules : INITIAL_SALARY_RULES;
    const structures = Array.isArray(parsed.structures) && parsed.structures.length > 0 ? parsed.structures : INITIAL_SALARY_STRUCTURES;
    const payruns = Array.isArray(parsed.payruns) ? parsed.payruns : INITIAL_PAYRUNS;
    const payslips = Array.isArray(parsed.payslips)
      ? parsed.payslips
      : generateSeedPayslips(payruns, employees, rules, structures);

    return {
      employees,
      rules,
      structures,
      payruns,
      payslips,
    };
  } catch (err) {
    console.warn("Failed to parse persisted Payroll state from localStorage:", err);
    return null;
  }
}

const PayrollContext = createContext(null);

export function PayrollProvider({ children }) {
  // Initialize state once safely from localStorage or initial mock data
  const persisted = loadPersistedState();

  const [employees, setEmployees] = useState(
    () => persisted?.employees || INITIAL_EMPLOYEES
  );

  const [rules, setRules] = useState(
    () => persisted?.rules || INITIAL_SALARY_RULES
  );

  const [structures, setStructures] = useState(
    () => persisted?.structures || INITIAL_SALARY_STRUCTURES
  );

  const [payruns, setPayruns] = useState(
    () => persisted?.payruns || INITIAL_PAYRUNS
  );

  const [payslips, setPayslips] = useState(
    () =>
      persisted?.payslips ||
      generateSeedPayslips(
        INITIAL_PAYRUNS,
        INITIAL_EMPLOYEES,
        INITIAL_SALARY_RULES,
        INITIAL_SALARY_STRUCTURES
      )
  );

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = "success") => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Safe unified persistence under the single versioned key: peoplepay360_payroll_v1
  useEffect(() => {
    try {
      const payload = {
        employees,
        rules,
        structures,
        payruns,
        payslips,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn("Error saving Payroll state to localStorage:", err);
    }
  }, [employees, rules, structures, payruns, payslips]);

  // Salary Rules Handlers
  const addSalaryRule = (newRule) => {
    const id = `RULE-${String(rules.length + 1).padStart(3, "0")}`;
    const item = { ...newRule, id, status: newRule.status || "Active" };
    setRules((prev) => [...prev, item]);
    showToast(`Salary Rule "${item.name}" created successfully.`);
    return item;
  };

  const updateSalaryRule = (id, updatedFields) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r))
    );
    showToast(`Salary Rule updated successfully.`);
  };

  const deleteSalaryRule = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    setStructures((prev) =>
      prev.map((s) => ({
        ...s,
        ruleIds: s.ruleIds.filter((rId) => rId !== id),
      }))
    );
    showToast(`Salary Rule removed.`);
  };

  // Salary Structures Handlers
  const addSalaryStructure = (newStructure) => {
    const id = `STRUC-${String(structures.length + 1).padStart(3, "0")}`;
    const item = {
      ...newStructure,
      id,
      status: "Active",
      ruleIds: newStructure.ruleIds || rules.map((r) => r.id),
    };
    setStructures((prev) => [...prev, item]);
    showToast(`Salary Structure "${item.name}" created.`);
    return item;
  };

  const updateSalaryStructure = (id, updatedFields) => {
    setStructures((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    showToast(`Salary Structure updated.`);
  };

  // PAYROLL LIFECYCLE 1: Create Payrun -> Sets status to 'Draft' (NO fully calculated payslips yet)
  const createPayrun = ({ name, period, startDate, endDate, departmentScope, selectedEmployeeIds, notes }) => {
    const newId = `PR-${new Date().getFullYear()}-${String(payruns.length + 1).padStart(2, "0")}`;

    const newPayrun = {
      id: newId,
      name,
      period,
      startDate,
      endDate,
      departmentScope: departmentScope || "All Departments",
      employeeIds: selectedEmployeeIds,
      status: "Draft",
      totalEmployees: selectedEmployeeIds.length,
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      paidAt: null,
      notes: notes || "",
      createdAt: new Date().toISOString(),
    };

    setPayruns((prev) => [newPayrun, ...prev]);
    showToast(`Draft Payrun "${name}" created. Click "Compute Payroll" to calculate.`);
    return newPayrun;
  };

  // PAYROLL LIFECYCLE 2: Draft -> Compute Payroll -> Evaluates Rules & Generates Calculated Payslips -> 'Computed'
  const computePayrun = (payrunId) => {
    const targetPr = payruns.find((pr) => pr.id === payrunId);
    if (!targetPr) return;

    // Calculate payslips for each employee in the payrun using current structures & rules
    const newOrUpdatedPayslips = targetPr.employeeIds.map((empId) => {
      const emp = employees.find((e) => e.id === empId);
      const calc = calculateEmployeeSalary(emp, rules, structures);
      return {
        id: `PS-${payrunId}-${emp.id}`,
        payrunId: payrunId,
        payrunName: targetPr.name,
        period: targetPr.period,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeCode: emp.employeeId,
        department: emp.department,
        position: emp.position,
        startDate: targetPr.startDate,
        endDate: targetPr.endDate,
        status: "Computed",
        basic: calc.basic,
        hra: calc.hra,
        meal: calc.meal,
        transport: calc.transport,
        otherAllowances: calc.otherAllowances,
        gross: calc.gross,
        pf: calc.pf,
        pt: calc.pt,
        tds: calc.tds,
        otherDeductions: calc.otherDeductions,
        totalDeductions: calc.totalDeductions,
        net: calc.net,
        structureName: calc.structureName,
        ruleBreakdown: calc.ruleBreakdown,
        bankAccount: emp.bankAccount,
        panNumber: emp.panNumber,
        createdAt: new Date().toISOString(),
      };
    });

    const totalGross = newOrUpdatedPayslips.reduce((sum, p) => sum + p.gross, 0);
    const totalDeductions = newOrUpdatedPayslips.reduce((sum, p) => sum + p.totalDeductions, 0);
    const totalNet = newOrUpdatedPayslips.reduce((sum, p) => sum + p.net, 0);

    // Update Payslips state (replace any existing for this payrun or append)
    setPayslips((prev) => [
      ...newOrUpdatedPayslips,
      ...prev.filter((ps) => ps.payrunId !== payrunId),
    ]);

    // Update Payrun state
    setPayruns((prev) =>
      prev.map((pr) =>
        pr.id === payrunId
          ? {
              ...pr,
              status: "Computed",
              totalGross,
              totalDeductions,
              totalNet,
            }
          : pr
      )
    );

    showToast(`Payroll computed! Evaluated ${newOrUpdatedPayslips.length} payslips via active rules.`);
  };

  // PAYROLL LIFECYCLE 3: Computed -> Validate -> 'Validated'
  const validatePayrun = (payrunId) => {
    setPayruns((prev) =>
      prev.map((pr) => (pr.id === payrunId ? { ...pr, status: "Validated" } : pr))
    );
    setPayslips((prev) =>
      prev.map((ps) => (ps.payrunId === payrunId ? { ...ps, status: "Validated" } : ps))
    );
    showToast(`Payrun validated for statutory compliance.`);
  };

  // PAYROLL LIFECYCLE 4: Validated -> Mark Paid -> 'Paid'
  const markPayrunPaid = (payrunId) => {
    const timestamp = new Date().toISOString();
    setPayruns((prev) =>
      prev.map((pr) =>
        pr.id === payrunId ? { ...pr, status: "Paid", paidAt: timestamp } : pr
      )
    );
    setPayslips((prev) =>
      prev.map((ps) => (ps.payrunId === payrunId ? { ...ps, status: "Paid" } : ps))
    );
    showToast(`Payrun disbursed! All ${payslips.filter((p) => p.payrunId === payrunId).length} payslips marked as Paid.`, "success");
  };

  // Reset demo data
  const resetPayrollData = () => {
    setEmployees(INITIAL_EMPLOYEES);
    setRules(INITIAL_SALARY_RULES);
    setStructures(INITIAL_SALARY_STRUCTURES);
    setPayruns(INITIAL_PAYRUNS);
    setPayslips(
      generateSeedPayslips(
        INITIAL_PAYRUNS,
        INITIAL_EMPLOYEES,
        INITIAL_SALARY_RULES,
        INITIAL_SALARY_STRUCTURES
      )
    );
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Clean up legacy keys if any existed
      localStorage.removeItem("peoplepay360_payroll_employees");
      localStorage.removeItem("peoplepay360_payroll_rules");
      localStorage.removeItem("peoplepay360_payroll_structures");
      localStorage.removeItem("peoplepay360_payroll_payruns");
      localStorage.removeItem("peoplepay360_payroll_payslips");
    } catch (e) {}
    showToast("Payroll demo data reset to defaults.");
  };

  return (
    <PayrollContext.Provider
      value={{
        employees,
        rules,
        structures,
        payruns,
        payslips,
        toastMessage,
        showToast,
        addSalaryRule,
        updateSalaryRule,
        deleteSalaryRule,
        addSalaryStructure,
        updateSalaryStructure,
        createPayrun,
        computePayrun,
        validatePayrun,
        markPayrunPaid,
        resetPayrollData,
        dashboardStats: MOCK_DASHBOARD_STATS,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
}

export function usePayroll() {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error("usePayroll must be used within a PayrollProvider");
  }
  return context;
}
