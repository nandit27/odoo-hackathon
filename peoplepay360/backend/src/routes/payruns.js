const express = require("express");
const controller = require("../controllers/payrunController");
const { requirePayrollRead, requirePayrollWrite } = require("../middleware/auth");

const router = express.Router();
router.post("/", requirePayrollWrite, controller.create);
router.get("/", requirePayrollRead, controller.list);
router.get("/:id/eligible-employees", requirePayrollRead, controller.eligibleEmployees);
router.post("/:id/create-payslips", requirePayrollWrite, controller.createPayslips);
router.post("/:id/compute", requirePayrollWrite, controller.compute);
router.post("/:id/validate", requirePayrollWrite, controller.validate);
router.post("/:id/mark-paid", requirePayrollWrite, controller.markPaid);
router.get("/:id", requirePayrollRead, controller.show);
module.exports = router;
