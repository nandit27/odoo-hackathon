const { getDashboard } = require("../services/dashboardService");

async function show(req, res, next) {
  try {
    res.json(await getDashboard(req.query));
  } catch (err) {
    next(err);
  }
}

module.exports = { show };
