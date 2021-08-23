const router = require("express").Router();
const User = require("../models/user/user");

// Home endpoint
router.get("", (_, res) => {
  res.send(`${process.env.APP_NAME} API!`);
});

router.get("/test", (req, res, next) => {
  const user = new User({ email: "Tom1", hash: "hash", salt: "salt" });
  user.save((err, user) => {
    if (err) {
      next(err);
    } else {
      res.status(201).send(user);
    }
  });
  //res.send(user);
});

module.exports = router;
