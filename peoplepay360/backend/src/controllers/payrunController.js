const payrunService = require("../services/payrunService");

const handle = (fn, status = 200) => async (req, res, next) => {
  try { res.status(status).json(await fn(req)); } catch (err) { next(err); }
};

module.exports = {
  create: handle((req) => payrunService.createPayrun(req.body, req.user), 201),
  eligibleEmployees: handle((req) => payrunService.eligibleEmployees(req.params.id)),
  createPayslips: handle((req) => payrunService.createPayslips(req.params.id, req.body), 201),
  compute: handle((req) => payrunService.compute(req.params.id)),
  validate: handle((req) => payrunService.validate(req.params.id)),
  markPaid: handle((req) => payrunService.markPaid(req.params.id)),
  show: handle((req) => payrunService.findPayrun(req.params.id)),
  showPayslip: handle((req) => payrunService.findPayslip(req.params.id)),
};
