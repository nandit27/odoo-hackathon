async function getStatus() {
  return { status: "ok", time: new Date().toISOString() };
}

module.exports = { getStatus };
