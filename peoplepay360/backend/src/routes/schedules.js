const express = require("express");
const scheduleController = require("../controllers/scheduleController");

const router = express.Router();

router.get("/", scheduleController.list);
router.post("/", scheduleController.create);
router.get("/:id", scheduleController.show);
router.put("/:id", scheduleController.update);

module.exports = router;
