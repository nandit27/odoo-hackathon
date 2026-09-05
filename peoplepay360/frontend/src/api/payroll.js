import api from "./axios.js";

const title = (value) => value?.toLowerCase().replace(/(^|_)(\w)/g, (_, __, letter) => letter.toUpperCase()) || "Draft";
const day = (value) => value?.slice(0, 10) || "";
const number = (value) => Number(value || 0);

export const employeeView = (item) => ({ ...item, employeeId: String(item.id), fullName: item.name, position: item.jobPosition, workEmail: item.email, joiningDate: day(item.dateJoined), status: title(item.status), workingSchedule: item.schedule?.name || "—" });
export const ruleView = (item) => ({ ...item, category: title(item.category), calcType: item.computationType?.toLowerCase(), amount: number(item.value), percentage: number(item.value), basedOn: item.percentageOfCode || "", status: "Active" });
export const structureView = (item) => ({ ...item, type: "Salary Structure", description: "", status: item.active ? "Active" : "Inactive", ruleIds: item.rules?.map((rule) => rule.id) || [] });
export const payrunView = (item) => ({ ...item, period: `${day(item.periodStart)} – ${day(item.periodEnd)}`, startDate: day(item.periodStart), endDate: day(item.periodEnd), status: title(item.status), employeeIds: item.payslips?.map((payslip) => payslip.employeeId) || [], totalEmployees: item.payslips?.length || 0, totalGross: (item.payslips || []).reduce((sum, payslip) => sum + number(payslip.gross), 0), totalNet: (item.payslips || []).reduce((sum, payslip) => sum + number(payslip.net), 0) });
export const payslipView = (item) => ({ ...item, payrunName: item.payrun?.name || "", period: item.payrun ? `${day(item.payrun.periodStart)} – ${day(item.payrun.periodEnd)}` : "", employeeName: item.employee?.name || "", department: item.employee?.department || "", position: item.employee?.jobPosition || "", gross: number(item.gross), net: number(item.net), status: title(item.status), ruleBreakdown: (item.lines || []).map((line) => ({ name: line.name, amount: number(line.amount) })) });

export const getPayrollData = async () => {
  const [employees, structures, rules, payruns, payslips] = await Promise.all([api.get("/api/employees"), api.get("/api/salary/structures"), api.get("/api/salary/rules"), api.get("/api/payruns"), api.get("/api/payslips")]);
  return { employees: employees.data.map(employeeView), structures: structures.data.map(structureView), rules: rules.data.map(ruleView), payruns: payruns.data.map(payrunView), payslips: payslips.data.map(payslipView) };
};
