const express = require("express");
const salaryController = require("../controllers/salaryController");
const { requirePayrollRead, requirePayrollWrite } = require("../middleware/auth");

const router = express.Router();

// Pay rules are configuration, not per-employee data, so there is nothing to scope to a caller:
// the whole gate is the role. Reads are wider than writes — HR_PAYROLL_USER can audit the rules
// that produce a payslip without being able to change what the next run pays.
router.get("/structures", requirePayrollRead, salaryController.listStructures);
router.post("/structures", requirePayrollWrite, salaryController.createStructure);
router.get("/structures/:id", requirePayrollRead, salaryController.showStructure);
router.put("/structures/:id", requirePayrollWrite, salaryController.updateStructure);
router.delete("/structures/:id", requirePayrollWrite, salaryController.removeStructure);

router.get("/rules", requirePayrollRead, salaryController.listRules);
router.post("/rules", requirePayrollWrite, salaryController.createRule);
router.get("/rules/:id", requirePayrollRead, salaryController.showRule);
router.put("/rules/:id", requirePayrollWrite, salaryController.updateRule);
router.delete("/rules/:id", requirePayrollWrite, salaryController.removeRule);

module.exports = router;
