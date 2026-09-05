const timeOffService = require("../services/timeOffService");

const handle = (fn, status = 200) =>
  async function route(req, res, next) {
    try {
      res.status(status).json(await fn(req));
    } catch (err) {
      next(err);
    }
  };

module.exports = {
  listTypes: handle(() => timeOffService.findTypes()),
  showType: handle((req) => timeOffService.findTypeById(req.params.id)),
  createType: handle((req) => timeOffService.createType(req.body), 201),
  updateType: handle((req) => timeOffService.updateType(req.params.id, req.body)),
  removeType: handle((req) => timeOffService.removeType(req.params.id)),

  listAllocations: handle((req) =>
    timeOffService.findAllocations({ employeeId: req.query.employeeId }, req.user)
  ),
  createAllocation: handle((req) => timeOffService.createAllocation(req.body), 201),

  listRequests: handle((req) =>
    timeOffService.findRequests(
      { employeeId: req.query.employeeId, status: req.query.status },
      req.user
    )
  ),
  createRequest: handle((req) => timeOffService.createRequest(req.body, req.user), 201),
  approveRequest: handle((req) => timeOffService.approve(req.params.id, req.user)),
  refuseRequest: handle((req) => timeOffService.refuse(req.params.id, req.user)),
};
