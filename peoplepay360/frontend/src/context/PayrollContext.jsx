import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";
import { getPayrollData, payrunView, ruleView, structureView } from "../api/payroll.js";
import { useAuth } from "../auth/AuthContext.jsx";

const PayrollContext = createContext(null);

export function PayrollProvider({ children }) {
  const { currentUser } = useAuth();
  const [data, setData] = useState({ employees: [], rules: [], structures: [], payruns: [], payslips: [] });
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (message, type = "success") => { setToastMessage({ message, type, id: Date.now() }); setTimeout(() => setToastMessage(null), 3500); };
  const refresh = async () => { if (!localStorage.getItem("peoplepay360.token")) return; try { setData(await getPayrollData()); } catch (err) { console.error("Unable to load payroll data", err); } };
  useEffect(() => { refresh(); }, [currentUser]);

  const addSalaryRule = async (rule) => { const { data: row } = await api.post("/api/salary/rules", { structureId: Number(rule.structureId || data.structures[0]?.id), name: rule.name, code: rule.code, category: String(rule.category).toUpperCase(), sequence: Number(rule.sequence), computationType: String(rule.calcType || "fixed").toUpperCase(), value: Number(rule.calcType === "percentage" ? rule.percentage : rule.amount), percentageOfCode: rule.basedOn || null }); await refresh(); showToast(`Salary Rule "${row.name}" created successfully.`); return ruleView(row); };
  const updateSalaryRule = async (id, rule) => { await api.put(`/api/salary/rules/${id}`, { name: rule.name, code: rule.code, category: String(rule.category).toUpperCase(), sequence: Number(rule.sequence), computationType: String(rule.calcType || "fixed").toUpperCase(), value: Number(rule.calcType === "percentage" ? rule.percentage : rule.amount), percentageOfCode: rule.basedOn || null }); await refresh(); showToast("Salary Rule updated successfully."); };
  const deleteSalaryRule = async (id) => { await api.delete(`/api/salary/rules/${id}`); await refresh(); showToast("Salary Rule removed."); };
  const addSalaryStructure = async (structure) => { const { data: row } = await api.post("/api/salary/structures", { name: structure.name, active: structure.status !== "Inactive" }); await refresh(); showToast(`Salary Structure "${row.name}" created.`); return structureView(row); };
  const updateSalaryStructure = async (id, structure) => { await api.put(`/api/salary/structures/${id}`, { name: structure.name, active: structure.status !== "Inactive" }); await refresh(); showToast("Salary Structure updated."); };
  const createPayrun = async ({ name, startDate, endDate, selectedEmployeeIds }) => { const structure = data.structures.find((item) => item.status === "Active"); if (!structure) throw new Error("Create an active salary structure first."); const { data: row } = await api.post("/api/payruns", { name, periodStart: startDate, periodEnd: endDate, salaryStructureId: structure.id }); await api.post(`/api/payruns/${row.id}/create-payslips`, { employeeIds: selectedEmployeeIds }); await refresh(); showToast(`Draft Payrun "${name}" created.`); return payrunView({ ...row, payslips: selectedEmployeeIds.map((employeeId) => ({ employeeId })) }); };
  const runAction = async (id, action, message) => { await api.post(`/api/payruns/${id}/${action}`); await refresh(); showToast(message); };
  const dashboardStats = { timeOffOverview: { paidTimeOff: 0, sickLeave: 0, compOff: 0, pendingRequests: 0 }, attendanceOverview: { present: 0, late: 0, absent: 0, overtimeHours: 0 }, monthlyTrends: [] };
  return <PayrollContext.Provider value={{ ...data, toastMessage, showToast, refresh, addSalaryRule, updateSalaryRule, deleteSalaryRule, addSalaryStructure, updateSalaryStructure, createPayrun, computePayrun: (id) => runAction(id, "compute", "Payroll computed."), validatePayrun: (id) => runAction(id, "validate", "Payrun validated."), markPayrunPaid: (id) => runAction(id, "mark-paid", "Payrun marked paid."), resetPayrollData: refresh, dashboardStats }}>{children}</PayrollContext.Provider>;
}

export function usePayroll() { const context = useContext(PayrollContext); if (!context) throw new Error("usePayroll must be used within a PayrollProvider"); return context; }
