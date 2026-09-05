const express = require("express");
const healthController = require("../controllers/healthController");
const { requireAuth, requireRole } = require("../middleware/auth");
const employeeRoutes = require("./employees");
const scheduleRoutes = require("./schedules");
const contractRoutes = require("./contracts");

const router = express.Router();

// Every HR resource below is gated on one list, so a new router cannot ship unprotected.
const HR_STAFF = requireRole(
  "ADMIN",
  "HR_MANAGER",
  "HR_PAYROLL_USER",
  "HR_PAYROLL_MANAGER"
);

router.get("/health", healthController.check);

router.use("/employees", requireAuth, HR_STAFF, employeeRoutes);
router.use("/schedules", requireAuth, HR_STAFF, scheduleRoutes);
router.use("/contracts", requireAuth, HR_STAFF, contractRoutes);

module.exports = router;
