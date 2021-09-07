const router = require("express").Router();

const appName = `${process.env.APP_NAME} API!`;

// Home endpoint
router.get("", (req, res) => {
  res.send(`${process.env.APP_NAME} API!`);
});

router.get(`/${process.env.APP_CONTEXT}`, (req, res) => {
  res.send(`${process.env.APP_NAME} API (version: ${process.env.APP_VERSION})!`);
});

module.exports = router;
