const { Prisma, ContractStatus, PayrunStatus } = require("@prisma/client");
const prisma = require("../prisma/client");
const { httpError, parseDate, parseId, parseText } = require("../utils/validate");

const D = (value) => new Prisma.Decimal(value || 0);
const money = (value) => D(value).toDecimalPlaces(2);

function period(data = {}) {
  const periodStart = parseDate(data.periodStart, "periodStart");
  const periodEnd = parseDate(data.periodEnd, "periodEnd");
  if (periodEnd < periodStart) throw httpError("periodEnd must be on or after periodStart");
  return { periodStart, periodEnd };
}

// A contract is applicable when its date range overlaps any day in the payrun period.
function applicableContractWhere(employeeId, { periodStart, periodEnd }) {
  return {
    employeeId,
    status: ContractStatus.ACTIVE,
    startDate: { lte: periodEnd },
    OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
  };
}

async function getPayrun(idParam, include = {}) {
  const id = parseId(idParam);
  const payrun = await prisma.payrun.findUnique({ where: { id }, include });
  if (!payrun) throw httpError(`payrun ${id} not found`, 404);
  return payrun;
}

async function createPayrun(data, actor) {
  const salaryStructureId = parseId(data.salaryStructureId, "salaryStructureId");
  const structure = await prisma.salaryStructure.findUnique({ where: { id: salaryStructureId } });
  if (!structure) throw httpError(`salary structure ${salaryStructureId} not found`, 404);
  return prisma.payrun.create({
    data: { name: parseText(data.name, "name"), ...period(data), salaryStructureId, createdById: actor.userId },
  });
}

async function eligibleEmployees(idParam) {
  const payrun = await getPayrun(idParam);
  return prisma.employee.findMany({
    where: { contracts: { some: applicableContractWhere(undefined, payrun) } },
    orderBy: { name: "asc" },
  });
}

function employeeIds(value) {
  if (!Array.isArray(value) || value.length === 0) throw httpError("employeeIds must be a non-empty array");
  const ids = value.map((id) => parseId(id, "employeeId"));
  if (new Set(ids).size !== ids.length) throw httpError("employeeIds must not contain duplicates");
  return ids;
}

async function createPayslips(idParam, data = {}) {
  const ids = employeeIds(data.employeeIds);
  return prisma.$transaction(async (tx) => {
    const payrun = await tx.payrun.findUnique({ where: { id: parseId(idParam) } });
    if (!payrun) throw httpError(`payrun ${idParam} not found`, 404);
    if (payrun.status !== PayrunStatus.DRAFT) throw httpError("payslips can only be created for a draft payrun", 409);

    const existing = await tx.payslip.findMany({ where: { payrunId: payrun.id, employeeId: { in: ids } } });
    if (existing.length) throw httpError(`a payslip already exists for employee ${existing[0].employeeId}`, 409);

    const rows = await Promise.all(ids.map(async (employeeId) => {
      const contract = await tx.contract.findFirst({
        where: applicableContractWhere(employeeId, payrun),
        orderBy: { startDate: "desc" },
      });
      if (!contract) throw httpError(`employee ${employeeId} has no active contract for this payrun period`);
      return { payrunId: payrun.id, employeeId, contractId: contract.id };
    }));
    await tx.payslip.createMany({ data: rows });
    return tx.payslip.findMany({ where: { payrunId: payrun.id }, include: { employee: { select: { id: true, name: true } } } });
  });
}

function calculateLines(rules, wage) {
  const context = {};
  const lines = rules.map((rule) => {
    const base = rule.percentageOfCode ? context[rule.percentageOfCode] : D(wage);
    const amount = rule.computationType === "FIXED"
      ? money(rule.value)
      : money(D(rule.value).dividedBy(100).times(base));
    context[rule.code] = amount;
    return { salaryRuleId: rule.id, name: rule.name, amount, category: rule.category };
  });
  const sum = (categories) => money(lines.filter((line) => categories.includes(line.category))
    .reduce((total, line) => total.plus(line.amount), D(0)));
  return { lines, gross: sum(["BASIC", "ALLOWANCE"]), deductions: sum(["DEDUCTION"]) };
}

async function compute(idParam) {
  return prisma.$transaction(async (tx) => {
    const payrun = await tx.payrun.findUnique({
      where: { id: parseId(idParam) },
      include: { salaryStructure: { include: { rules: { orderBy: { sequence: "asc" } } } }, payslips: { include: { contract: true, employee: true } } },
    });
    if (!payrun) throw httpError(`payrun ${idParam} not found`, 404);
    if (![PayrunStatus.DRAFT, PayrunStatus.COMPUTED].includes(payrun.status)) throw httpError("only draft or computed payruns can be computed", 409);

    const warnings = [];
    for (const payslip of payrun.payslips) {
      if (D(payslip.contract.wage).isZero()) warnings.push(`employee ${payslip.employee.name} has no wage set`);
      const result = calculateLines(payrun.salaryStructure.rules, payslip.contract.wage);
      await tx.payslipLine.deleteMany({ where: { payslipId: payslip.id } });
      await tx.payslipLine.createMany({ data: result.lines.map(({ category, ...line }) => ({ ...line, payslipId: payslip.id })) });
      await tx.payslip.update({
        where: { id: payslip.id },
        data: { gross: result.gross, net: result.gross.minus(result.deductions), status: PayrunStatus.COMPUTED, generatedAt: new Date() },
      });
    }
    await tx.payrun.update({ where: { id: payrun.id }, data: { status: PayrunStatus.COMPUTED } });
    return { payrunId: payrun.id, warnings };
  });
}

async function validate(idParam) {
  return prisma.$transaction(async (tx) => {
    const payrun = await tx.payrun.findUnique({ where: { id: parseId(idParam) }, include: { payslips: true } });
    if (!payrun) throw httpError(`payrun ${idParam} not found`, 404);
    if (payrun.payslips.some((payslip) => payslip.status === PayrunStatus.DRAFT)) throw httpError("all payslips must be computed before validation", 409);
    await tx.payslip.updateMany({ where: { payrunId: payrun.id }, data: { status: PayrunStatus.VALIDATED } });
    return tx.payrun.update({ where: { id: payrun.id }, data: { status: PayrunStatus.VALIDATED } });
  });
}

async function markPaid(idParam) {
  const payrun = await getPayrun(idParam);
  if (payrun.status !== PayrunStatus.VALIDATED) throw httpError("payrun must be validated before it can be marked paid", 409);
  return prisma.$transaction(async (tx) => {
    await tx.payslip.updateMany({ where: { payrunId: payrun.id }, data: { status: PayrunStatus.PAID } });
    return tx.payrun.update({ where: { id: payrun.id }, data: { status: PayrunStatus.PAID } });
  });
}

async function findPayrun(idParam) {
  return getPayrun(idParam, { payslips: { include: { employee: { select: { id: true, name: true } } } } });
}

function findPayruns() {
  return prisma.payrun.findMany({
    include: { payslips: { include: { employee: { select: { id: true, name: true, department: true, jobPosition: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

async function findPayslip(idParam) {
  const id = parseId(idParam);
  const payslip = await prisma.payslip.findUnique({ include: { employee: { select: { id: true, name: true } }, contract: true, lines: { include: { salaryRule: true } } }, where: { id } });
  if (!payslip) throw httpError(`payslip ${id} not found`, 404);
  return payslip;
}

function findPayslips() {
  return prisma.payslip.findMany({
    include: { employee: { select: { id: true, name: true, department: true, jobPosition: true } }, payrun: true },
    orderBy: { generatedAt: "desc" },
  });
}

module.exports = { applicableContractWhere, calculateLines, createPayrun, eligibleEmployees, createPayslips, compute, validate, markPaid, findPayruns, findPayrun, findPayslips, findPayslip };
