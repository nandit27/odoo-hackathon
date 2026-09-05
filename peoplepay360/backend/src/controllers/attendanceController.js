const attendanceService = require("../services/attendanceService");

async function list(req, res, next) {
  try {
    const records = await attendanceService.findAll(
      { employeeId: req.query.employeeId, from: req.query.from, to: req.query.to },
      req.user
    );
    res.json(records);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const record = await attendanceService.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const record = await attendanceService.update(req.params.id, req.body);
    res.json(record);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update };
