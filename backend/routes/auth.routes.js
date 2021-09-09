const router = require("express").Router();
const authService = require("../services/auth.service");
const Provider = require("../util/enums").provider;

router.post("/login", authService.nonAuthenticate, authService.login);
router.post("/register", authService.nonAuthenticate, authService.register);

router.get("/facebook", authService.redirectTo(Provider.FACEBOOK));
router.get("/facebook/callback", authService.sendToken(Provider.FACEBOOK));

router.get("/google", authService.redirectTo(Provider.GOOGLE));
router.get("/google/callback", authService.sendToken(Provider.GOOGLE));

router.get("/user", authService.authenticate, (req, res) => {
  res.send(req.user);
});

module.exports = router;
