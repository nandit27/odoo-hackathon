function httpError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function parseId(value, label = "id") {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw httpError(`${label} must be a positive integer`);
  }
  return id;
}

function parseDate(value, label) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw httpError(`${label} must be a valid date`);
  }
  return date;
}

function parseText(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw httpError(`${label} is required`);
  }
  return value.trim();
}

function parseBoolean(value, label) {
  if (typeof value !== "boolean") {
    throw httpError(`${label} must be true or false`);
  }
  return value;
}

// Membership check against a Prisma enum object, so the allowed list never drifts from the schema.
function enumValue(enumObject, value, label) {
  const allowed = Object.values(enumObject);
  if (!allowed.includes(value)) {
    throw httpError(`${label} must be one of: ${allowed.join(", ")}`);
  }
  return value;
}

module.exports = { httpError, parseId, parseDate, parseText, parseBoolean, enumValue };
