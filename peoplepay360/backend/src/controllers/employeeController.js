const employeeService = require("../services/employeeService");

async function list(req, res, next) {
  try {
    const employees = await employeeService.findAll();
    res.json(employees);
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const employee = await employeeService.findById(req.params.id);
    res.json(employee);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const employee = await employeeService.create(req.body);
    res.status(201).json(employee);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const employee = await employeeService.update(req.params.id, req.body);
    res.json(employee);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, show, create, update };
