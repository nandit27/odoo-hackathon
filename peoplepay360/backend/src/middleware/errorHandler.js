// Prisma error codes worth translating instead of leaking as a 500.
const PRISMA_STATUS = { P2002: 409, P2003: 400, P2025: 404 };

function prismaMessage(err) {
  const target = err.meta && err.meta.target;
  switch (err.code) {
    case "P2002":
      return `${Array.isArray(target) ? target.join(", ") : "value"} already exists`;
    case "P2003":
      return "a referenced record does not exist";
    default:
      return "record not found";
  }
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  if (PRISMA_STATUS[err.code]) {
    return res.status(PRISMA_STATUS[err.code]).json({ error: prismaMessage(err) });
  }
  // Validation errors carry the whole schema in their message — do not echo it back.
  if (err.name === "PrismaClientValidationError") {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
}

module.exports = errorHandler;
