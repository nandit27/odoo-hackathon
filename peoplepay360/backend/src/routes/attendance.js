const express = require("express");
const attendanceController = require("../controllers/attendanceController");
const { requireHrStaff } = require("../middleware/auth");

const router = express.Router();

// GET is open to any authenticated caller; attendanceService pins non-HR callers to their own
// employeeId. Writing attendance stays with HR staff.
router.get("/", attendanceController.list);
router.post("/", requireHrStaff, attendanceController.create);
router.put("/:id", requireHrStaff, attendanceController.update);

module.exports = router;
