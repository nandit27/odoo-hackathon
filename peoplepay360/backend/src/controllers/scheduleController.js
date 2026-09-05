const scheduleService = require("../services/scheduleService");

async function list(req, res, next) {
  try {
    const schedules = await scheduleService.findAll();
    res.json(schedules);
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const schedule = await scheduleService.findById(req.params.id);
    res.json(schedule);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const schedule = await scheduleService.create(req.body);
    res.status(201).json(schedule);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const schedule = await scheduleService.update(req.params.id, req.body);
    res.json(schedule);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, show, create, update };
