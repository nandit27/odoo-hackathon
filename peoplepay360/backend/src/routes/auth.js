const express = require("express");
const authController = require("../controllers/authController");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

// optionalAuth so an ADMIN token can set `role`; every other caller gets EMPLOYEE.
router.post("/register", optionalAuth, authController.register);
router.post("/login", authController.login);

module.exports = router;
