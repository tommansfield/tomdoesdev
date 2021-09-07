const router = require("express").Router();

const appName = `${process.env.APP_NAME} API!`;

// Home endpoint
router.get("", (req, res) => {
  res.send(appName);
});

router.get(`/${process.env.APP_CONTEXT}`, (req, res) => {
  res.send(`${appName} (version: ${process.env.APP_VERSION})`);
});

module.exports = router;
