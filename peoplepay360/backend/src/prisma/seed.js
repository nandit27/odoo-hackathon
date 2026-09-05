const bcrypt = require("bcrypt");
require("dotenv").config();

const prisma = require("./client");
const { assertRulesConsistent } = require("../services/salaryService");

const ADMIN_EMAIL = "admin@peoplepay360.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin123";
const BCRYPT_ROUNDS = 10;

const STRUCTURE_NAME = "Regular Salary";

// Gross = BASIC + HRA, net = gross - PF. The engine derives both from the categories, so this set
// only has to declare the three inputs in the order they can be computed.
const RULES = [
  {
    code: "BASIC",
    name: "Basic Salary",
    category: "BASIC",
    sequence: 1,
    computationType: "FIXED",
    value: 30000,
    percentageOfCode: null,
  },
  {
    code: "HRA",
    name: "House Rent Allowance",
    category: "ALLOWANCE",
    sequence: 2,
    computationType: "PERCENTAGE",
    value: 40,
    percentageOfCode: "BASIC",
  },
  {
    code: "PF",
    name: "Provident Fund",
    category: "DEDUCTION",
    sequence: 3,
    computationType: "PERCENTAGE",
    value: 12,
    percentageOfCode: "BASIC",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: "Admin", passwordHash, role: "ADMIN" },
    create: { name: "Admin", email: ADMIN_EMAIL, passwordHash, role: "ADMIN" },
  });

  console.log(`Seeded ADMIN user ${admin.email} (id ${admin.id})`);

  // The seed writes through Prisma, not through salaryService, so run the same consistency check
  // the API would: a typo here would otherwise ship a structure the payroll engine cannot evaluate.
  assertRulesConsistent(RULES);

  const structure = await prisma.salaryStructure.upsert({
    where: { name: STRUCTURE_NAME },
    update: { active: true },
    create: { name: STRUCTURE_NAME, active: true },
  });

  for (const rule of RULES) {
    await prisma.salaryRule.upsert({
      where: { structureId_code: { structureId: structure.id, code: rule.code } },
      update: rule,
      create: { ...rule, structureId: structure.id },
    });
  }

  console.log(
    `Seeded salary structure "${structure.name}" (id ${structure.id}) with ` +
      `${RULES.length} rules: ${RULES.map((rule) => rule.code).join(", ")}`
  );

  // Small, idempotent demo dataset used by the connected frontend. Keep it here rather than in
  // browser memory so every module reads the same records through the API.
  let schedule = await prisma.workingSchedule.findFirst({ where: { name: "Standard 9–6" } });
  if (!schedule) {
    schedule = await prisma.workingSchedule.create({
      data: {
        name: "Standard 9–6",
        type: "Standard",
        weeklyHours: 40,
        pattern: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => ({ day, startTime: "09:00", endTime: "18:00", breakMinutes: 60 })),
      },
    });
  }

  const people = [
    ["Riya Patel", "riya.patel@peoplepay360.com", "Engineering", "Software Engineer"],
    ["Aarav Shah", "aarav.shah@peoplepay360.com", "Human Resources", "HR Executive"],
    ["Meera Desai", "meera.desai@peoplepay360.com", "Finance", "Finance Analyst"],
    ["Kabir Singh", "kabir.singh@peoplepay360.com", "Operations", "Operations Lead"],
  ];
  const employees = [];
  for (const [name, email, department, jobPosition] of people) {
    employees.push(await prisma.employee.upsert({
      where: { email },
      update: { name, department, jobPosition, scheduleId: schedule.id, status: "ACTIVE" },
      create: { name, email, department, jobPosition, scheduleId: schedule.id, status: "ACTIVE", dateJoined: new Date("2024-01-01") },
    }));
  }

  for (const employee of employees) {
    const contract = await prisma.contract.findFirst({ where: { employeeId: employee.id, status: "ACTIVE" } });
    if (!contract) await prisma.contract.create({
      data: { employeeId: employee.id, salaryStructureId: structure.id, startDate: new Date("2024-01-01"), wage: 50000, status: "ACTIVE", department: employee.department, position: employee.jobPosition },
    });
  }

  const leaveType = await prisma.timeOffType.upsert({
    where: { name: "Paid Leave" },
    update: {},
    create: { name: "Paid Leave", unit: "DAYS", requiresAllocation: true, affectsPayroll: true },
  });
  for (const employee of employees) {
    const allocation = await prisma.timeOffAllocation.findFirst({ where: { employeeId: employee.id, timeOffTypeId: leaveType.id } });
    if (!allocation) await prisma.timeOffAllocation.create({
      data: { employeeId: employee.id, timeOffTypeId: leaveType.id, allocated: 18, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") },
    });
  }

  await prisma.user.upsert({
    where: { email: "riya.patel@peoplepay360.com" },
    update: { passwordHash, role: "EMPLOYEE", employeeId: employees[0].id },
    create: { name: "Riya Patel", email: "riya.patel@peoplepay360.com", passwordHash, role: "EMPLOYEE", employeeId: employees[0].id },
  });
  for (const [name, email, role] of [["Neha Joshi", "hr.manager@peoplepay360.com", "HR_MANAGER"], ["Arjun Mehta", "payroll.user@peoplepay360.com", "HR_PAYROLL_USER"], ["Priya Shah", "payroll.manager@peoplepay360.com", "HR_PAYROLL_MANAGER"]]) {
    await prisma.user.upsert({ where: { email }, update: { name, passwordHash, role }, create: { name, email, passwordHash, role } });
  }

  console.log(`Seeded ${employees.length} employees, contracts, leave balances, and demo login accounts (password: ${ADMIN_PASSWORD})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
