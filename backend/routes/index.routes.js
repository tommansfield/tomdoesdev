const router = require("express").Router();

// Home endpoint
router.get("", (_, res) => {
  res.send(`${process.env.APP_NAME} API!`);
});

router.get("/test", (req, res, next) => {
  res.send("protected :)");
});

module.exports = router;
