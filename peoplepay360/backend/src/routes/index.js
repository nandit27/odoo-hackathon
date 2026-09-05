const express = require("express");
const healthController = require("../controllers/healthController");
const employeeRoutes = require("./employees");

const router = express.Router();

router.get("/health", healthController.check);
router.use("/employees", employeeRoutes);

module.exports = router;
