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

module.exports = { httpError, parseId, parseDate };
