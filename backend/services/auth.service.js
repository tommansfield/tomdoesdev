const Constants = require("../util/constants");
const User = require("mongoose").model("User");
const provider = require("../util/enums").provider;
const authUtils = require("../auth/auth-utils");
const userService = require("./user.service");

module.exports.login = (req, res, next) => {
  console.log(req.body.email);
  const errors = validateLogin(req.body);
  if (errors.length) {
    return res.status(400).json({ errors });
  }
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      const error = `No user found for email address: ${req.body.email}`;
      return res.status(404).json({ error });
    }
    const isValid = authUtils.validPassword(req.body.password, user.hash, user.salt);

    if (isValid) {
      const signedJWT = authUtils.issueJWT(user);
      user.lastLogin = Date.now();
      user.save((err, newUser) => {
        if (err) {
          return next(err);
        }
        return res.json({ user, token: signedJWT.token, expiresIn: signedJWT.expiresIn });
      });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });
};

module.exports.register = (req, res, next) => {
  const errors = validateRegistration(req.body);
  if (errors.length) {
    return res.status(400).json({ errors });
  }
  userService.existsByEmail(req, res, () => {
    const saltHash = authUtils.generateSaltAndHash(req.body.password);
    const user = new User({
      email: req.body.email,
      hash: saltHash.hash,
      salt: saltHash.salt,
    });
    user.lastLogin = Date.now();
    user.save((err, newUser) => {
      if (err) {
        return next(err);
      }
      const signedJWT = authUtils.issueJWT(user);
      console.log(`Successfully created new user for email address: ${newUser.email}.`);
      res.json({ user, token: signedJWT.token, expiresIn: signedJWT.expiresIn });
    });
  });
};

module.exports.getUser = (req, res, next) => {
  res.send(req.user);
};

validateLogin = function (request) {
  const errors = [];
  if (!request.email) {
    errors.push("Please enter an email address.");
  } else if (!Constants.validation.validEmail.test(request.email)) {
    errors.push("Invalid email address.");
  }
  if (!request.password) {
    errors.push("Please enter a password.");
  } else if (request.password.length < 8) {
    errors.push("Password should be at least 8 characters.");
  } else if (request.password.length > 64) {
    errors.push("Password length should not exceed 64 characters.");
  }
  return errors;
};

validateRegistration = function (request) {
  const errors = [];
  if (!request.email) {
    errors.push("Please enter an email address.");
  } else if (!Constants.validation.validEmail.test(request.email)) {
    errors.push("Invalid email address.");
  }
  if (!request.password) {
    errors.push("Please enter a password.");
  } else if (request.password.length < 8) {
    errors.push("Password should be at least 8 characters.");
  } else if (request.password.length > 64) {
    errors.push("Password length should not exceed 64 characters.");
  } else if (!Constants.validation.lowerCaseLetters.test(request.password)) {
    errors.push("Password should contain at least one lowercase letter.");
  } else if (!Constants.validation.upperCaseLetters.test(request.password)) {
    errors.push("Password should contain at least one uppercase letter.");
  } else if (!Constants.validation.numbers.test(request.password)) {
    errors.push("Password should contain at least one number.");
  }
  if (!request.matchingPassword) {
    errors.push("Please enter a matching password.");
  } else if (request.password && request.password.localeCompare(request.matchingPassword) !== 0) {
    errors.push("Passwords do not match.");
  }
  return errors;
};
