const salaryService = require("../services/salaryService");

// Same wrapper as timeOffController: ten endpoints of identical try/catch/next is noise.
const handle = (fn, status = 200) =>
  async function route(req, res, next) {
    try {
      res.status(status).json(await fn(req));
    } catch (err) {
      next(err);
    }
  };

module.exports = {
  listStructures: handle(() => salaryService.findStructures()),
  showStructure: handle((req) => salaryService.findStructureById(req.params.id)),
  createStructure: handle((req) => salaryService.createStructure(req.body), 201),
  updateStructure: handle((req) => salaryService.updateStructure(req.params.id, req.body)),
  removeStructure: handle((req) => salaryService.removeStructure(req.params.id)),

  listRules: handle((req) => salaryService.findRules({ structureId: req.query.structureId })),
  showRule: handle((req) => salaryService.findRuleById(req.params.id)),
  createRule: handle((req) => salaryService.createRule(req.body), 201),
  updateRule: handle((req) => salaryService.updateRule(req.params.id, req.body)),
  removeRule: handle((req) => salaryService.removeRule(req.params.id)),
};
