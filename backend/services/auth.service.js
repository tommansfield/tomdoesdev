const passport = require("passport");
const authUtils = require("../auth/auth-utils");
const userService = require("./user.service");
const Provider = require("../util/enums").provider;
const Constants = require("../util/constants");
const User = require("mongoose").model("User");
const Role = require("../models/user/role");

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
    user.save((err, newUser) => {
      if (err) {
        return next(err);
      }
      console.log(`Successfully signed up new user: ${newUser.email}.`);
      signJWTToken(newUser, res);
    });
  });
};

module.exports.login = (req, res, next) => {
  const errors = validateLogin(req.body);
  if (errors.length) {
    return res.status(400).json({ errors });
  }
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      const error = `No user found for email address: ${req.body.email}.`;
      return res.status(401).json({ error });
    }
    const isValid = authUtils.validPassword(
      req.body.password,
      user.hash,
      user.salt
    );
    if (!isValid) {
      res.status(401).json({ error: "Invalid password." });
    } else {
      signJWTToken(user, res);
    }
  });
};

const authenticate = (req, res, next) => {
  passport.authenticate(Provider.LOCAL, { session: false })(req, res, next);
};

module.exports.authenticate = authenticate;

module.exports.nonAuthenticate = (req, res, next) => {
  passport.authenticate(Provider.LOCAL, { session: false }, (err, user) => {
    console.log(err);
    if (user) {
      const error = "Already logged in.";
      return res.status(400).json({ error });
    }
    next();
  })(req, res, next);
};

module.exports.redirectTo = (provider) => {
  switch (provider) {
    case Provider.FACEBOOK: {
      return passport.authenticate(Provider.FACEBOOK, {
        scope: ["email", "public_profile"],
      });
    }
    default:
      return (req, res, next) => {
        const error = {
          status: 400,
          message: `Unknown authentication provider: ${provider}.`,
        };
        next(error);
      };
  }
};

module.exports.sendToken = (provider) => {
  return (req, res, next) => {
    passport.authenticate(
      provider || Provider.LOCAL,
      { session: false },
      (err, user) => {
        if (err) {
          return res.status(401).json({ error: err });
        }
        if (user) {
          return signJWTToken(user, res);
        } else {
          const error = "Unable to retrieve user information.";
          res.status(401).json({ error });
        }
      }
    )(req, res, next);
  };
};

const signJWTToken = function (user, res) {
  const signedJWT = authUtils.issueJWT(user);
  return res.json({
    user,
    token: signedJWT.token,
    expiresIn: signedJWT.expiresIn,
  });
};

const validateLogin = function (request) {
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

const validateRegistration = function (request) {
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
  } else if (
    request.password &&
    request.password.localeCompare(request.matchingPassword) !== 0
  ) {
    errors.push("Passwords do not match.");
  }
  return errors;
};
