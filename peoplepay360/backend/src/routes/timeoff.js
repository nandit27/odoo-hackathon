const express = require("express");
const timeOffController = require("../controllers/timeOffController");
const { requireHrStaff } = require("../middleware/auth");

const router = express.Router();

// Types are policy: only HR staff read or write them.
router.get("/types", requireHrStaff, timeOffController.listTypes);
router.post("/types", requireHrStaff, timeOffController.createType);
router.get("/types/:id", requireHrStaff, timeOffController.showType);
router.put("/types/:id", requireHrStaff, timeOffController.updateType);
router.delete("/types/:id", requireHrStaff, timeOffController.removeType);

// Granting a balance is an HR act; reading one is scoped to the caller by timeOffService.
router.get("/allocations", timeOffController.listAllocations);
router.post("/allocations", requireHrStaff, timeOffController.createAllocation);

// Employees file and read their own requests; only HR staff decide them.
router.get("/requests", timeOffController.listRequests);
router.post("/requests", timeOffController.createRequest);
router.put("/requests/:id/approve", requireHrStaff, timeOffController.approveRequest);
router.put("/requests/:id/refuse", requireHrStaff, timeOffController.refuseRequest);

module.exports = router;
