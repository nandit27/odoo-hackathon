const healthService = require("../services/healthService");

async function check(req, res, next) {
  try {
    const data = await healthService.getStatus();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { check };
