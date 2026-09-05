const express = require("express");
const healthController = require("../controllers/healthController");
const { requireAuth, requireHrStaff } = require("../middleware/auth");
const employeeRoutes = require("./employees");
const scheduleRoutes = require("./schedules");
const contractRoutes = require("./contracts");
const attendanceRoutes = require("./attendance");
const timeOffRoutes = require("./timeoff");
const salaryRoutes = require("./salary");
const payrunRoutes = require("./payruns");
const payslipRoutes = require("./payslips");

const router = express.Router();

router.get("/health", healthController.check);

// Every HR resource below is gated on one role list, so a new router cannot ship unprotected.
router.use("/employees", requireAuth, requireHrStaff, employeeRoutes);
router.use("/schedules", requireAuth, requireHrStaff, scheduleRoutes);
router.use("/contracts", requireAuth, requireHrStaff, contractRoutes);

// Attendance and time off are the exceptions: employees may read their own rows, so the role
// check moves down into those routers and the services scope the queries.
router.use("/attendance", requireAuth, attendanceRoutes);
router.use("/timeoff", requireAuth, timeOffRoutes);

// Salary configuration splits read from write, so its router carries two different role guards.
router.use("/salary", requireAuth, salaryRoutes);
router.use("/payruns", requireAuth, payrunRoutes);
router.use("/payslips", requireAuth, payslipRoutes);

module.exports = router;
