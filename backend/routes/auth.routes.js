const router = require("express").Router();
const passport = require("passport");
const authUtils = require("../auth/auth-utils");
const authService = require("../services/auth.service");
const Provider = require("../util/enums").provider;

router.post("/login", authService.login);
router.post("/register", authService.register);

router.get("/facebook", authService.redirectTo(Provider.FACEBOOK));
router.get("/facebook/callback", authService.sendToken(Provider.FACEBOOK));
router.get("/user", authService.getUser());

module.exports = router;
