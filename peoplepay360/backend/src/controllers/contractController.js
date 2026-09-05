const contractService = require("../services/contractService");

async function list(req, res, next) {
  try {
    const contracts = await contractService.findAll({ employeeId: req.query.employeeId });
    res.json(contracts);
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const contract = await contractService.findById(req.params.id);
    res.json(contract);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const contract = await contractService.create(req.body);
    res.status(201).json(contract);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const contract = await contractService.update(req.params.id, req.body);
    res.json(contract);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, show, create, update };
