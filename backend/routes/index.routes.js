const router = require("express").Router();
const passport = require("passport");

// Home endpoint
router.get("", (_, res) => {
  res.send(`${process.env.APP_NAME} API!`);
});

module.exports = router;
