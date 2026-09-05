const authService = require("../services/authService");

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body, {
      allowRole: req.user && req.user.role === "ADMIN",
    });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
