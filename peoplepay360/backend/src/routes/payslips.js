const express = require("express");
const { listPayslips, showPayslip } = require("../controllers/payrunController");
const { requirePayrollRead } = require("../middleware/auth");

const router = express.Router();
router.get("/", requirePayrollRead, listPayslips);
router.get("/:id", requirePayrollRead, showPayslip);
module.exports = router;
