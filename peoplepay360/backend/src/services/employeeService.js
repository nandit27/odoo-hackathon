const prisma = require("../prisma/client");

async function findAll() {
  return prisma.employee.findMany({ orderBy: { id: "desc" }, take: 100 });
}

async function create(data) {
  const { firstName, lastName, email } = data;
  if (!firstName || !lastName || !email) {
    const err = new Error("firstName, lastName and email are required");
    err.status = 400;
    throw err;
  }
  return prisma.employee.create({ data });
}

module.exports = { findAll, create };
