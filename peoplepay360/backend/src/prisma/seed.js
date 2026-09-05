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
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
