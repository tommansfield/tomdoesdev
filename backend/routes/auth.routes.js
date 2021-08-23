const router = require("express").Router();
const authService = require("../services/auth.service");

router.post("/login", authService.login);
router.post("/register", authService.register);

module.exports = router;
