const express = require("express");
const employeeController = require("../controllers/employeeController");

const router = express.Router();

router.get("/", employeeController.list);
router.post("/", employeeController.create);

module.exports = router;
