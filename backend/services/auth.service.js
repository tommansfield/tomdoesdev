const passport = require("passport");
const authUtils = require("../auth/auth-utils");
const userService = require("./user.service");
const Provider = require("../util/enums").provider;
const Constants = require("../util/constants");
const User = require("mongoose").model("User");

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
      return signJWTToken(user);
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
      const error = `No user found for email address: ${req.body.email}`;
      return res.status(404).json({ error });
    }
    const isValid = authUtils.validPassword(req.body.password, user.hash, user.salt);
    if (isValid) {
      signJWTToken(user, res);
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });
};

module.exports.redirectTo = (provider) => {
  switch (provider) {
    case Provider.FACEBOOK: {
      return passport.authenticate(Provider.FACEBOOK, { scope: ["email", "public_profile"] });
    }
    default:
      return (req, res, next) => {
        const error = { status: 400, message: `Unknown authentication provider: ${provider}` };
        next(error);
      };
  }
};

const authenticate = (provider) => {
  return (req, res, next) => {
    passport.authenticate(provider || Provider.LOCAL, { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

module.authenticate = authenticate;

module.exports.getUser = (provider) => {
  return (req, res) => {
    authenticate(provider)(req, res, () => {
      res.send(req.user);
    });
  };
};

module.exports.sendToken = (provider) => {
  return (req, res) => {
    authenticate(provider)(req, res, () => {
      signJWTToken(req.user, res);
    });
  };
};

signJWTToken = function (user, res) {
  const signedJWT = authUtils.issueJWT(user);
  return res.json({ user, token: signedJWT.token, expiresIn: signedJWT.expiresIn });
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
