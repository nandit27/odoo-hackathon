const express = require("express");
const { showPayslip } = require("../controllers/payrunController");
const { requirePayrollRead } = require("../middleware/auth");

const router = express.Router();
router.get("/:id", requirePayrollRead, showPayslip);
module.exports = router;
