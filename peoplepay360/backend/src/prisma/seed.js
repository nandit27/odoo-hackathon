const bcrypt = require("bcrypt");
require("dotenv").config();

const prisma = require("./client");

const ADMIN_EMAIL = "admin@peoplepay360.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin123";
const BCRYPT_ROUNDS = 10;

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: "Admin", passwordHash, role: "ADMIN" },
    create: { name: "Admin", email: ADMIN_EMAIL, passwordHash, role: "ADMIN" },
  });

  console.log(`Seeded ADMIN user ${admin.email} (id ${admin.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
