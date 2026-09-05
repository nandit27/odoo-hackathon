const express = require("express");
const contractController = require("../controllers/contractController");

const router = express.Router();

router.get("/", contractController.list);
router.post("/", contractController.create);
router.get("/:id", contractController.show);
router.put("/:id", contractController.update);

module.exports = router;
