const router = require("express").Router();
const passport = require("passport");
const authService = require("../services/auth.service");

router.post("/login", authService.login);
router.post("/register", authService.register);
// TODO: authentication middleware
router.get("/user", passport.authenticate("jwt", { session: false }), authService.getUser);

module.exports = router;
