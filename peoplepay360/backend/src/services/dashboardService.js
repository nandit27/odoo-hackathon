const { Prisma, EmployeeStatus, PayrunStatus, TimeOffStatus } = require("@prisma/client");
const prisma = require("../prisma/client");
const { httpError, parseDate, parseText } = require("../utils/validate");

const D = (value) => new Prisma.Decimal(value || 0);

function filters(query = {}) {
  if (!query.periodStart || !query.periodEnd) {
    throw httpError("periodStart and periodEnd are required");
  }
  const periodStart = parseDate(query.periodStart, "periodStart");
  const periodEnd = parseDate(query.periodEnd, "periodEnd");
  if (periodEnd < periodStart) throw httpError("periodEnd must be on or after periodStart");
  return {
    periodStart,
    periodEnd,
    department: query.department === undefined || query.department === ""
      ? undefined
      : parseText(query.department, "department"),
  };
}

function payrunWhere({ periodStart, periodEnd }) {
  return { periodStart: { lte: periodEnd }, periodEnd: { gte: periodStart } };
}

async function getDashboard(query) {
  const { periodStart, periodEnd, department } = filters(query);
  const runs = payrunWhere({ periodStart, periodEnd });
  const paidPayslipWhere = { status: PayrunStatus.PAID, payrun: runs };
  const payslipWhere = { payrun: runs };
  const employeeWhere = { status: EmployeeStatus.ACTIVE, ...(department ? { department } : {}) };

  const [paid, payslipsGenerated, headcount, approvedTimeOffCount, salaryRows] = await Promise.all([
    prisma.payslip.aggregate({ where: paidPayslipWhere, _sum: { net: true } }),
    prisma.payslip.count({ where: payslipWhere }),
    prisma.employee.count({ where: employeeWhere }),
    prisma.timeOffRequest.count({
      where: { status: TimeOffStatus.APPROVED, startDate: { lte: periodEnd }, endDate: { gte: periodStart } },
    }),
    prisma.payslip.findMany({
      where: paidPayslipWhere,
      select: { net: true, employee: { select: { department: true } } },
    }),
  ]);

  const totalNetSalaryPaid = D(paid._sum.net);
  const byDepartment = salaryRows.reduce((totals, row) => {
    const key = row.employee.department;
    totals[key] = D(totals[key]).plus(row.net);
    return totals;
  }, {});

  return {
    totalNetSalaryPaid,
    payslipsGenerated,
    averageSalary: payslipsGenerated ? totalNetSalaryPaid.dividedBy(payslipsGenerated).toDecimalPlaces(2) : D(0),
    headcount,
    approvedTimeOffCount,
    salaryCostByDepartment: Object.entries(byDepartment).map(([department, total]) => ({
      department,
      total,
    })),
  };
}

module.exports = { filters, payrunWhere, getDashboard };
