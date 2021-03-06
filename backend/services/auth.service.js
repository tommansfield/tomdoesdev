const passport = require("passport");
const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const User = require("mongoose").model("User");
const Role = require("../models/user/role");
const crypto = require("../auth/crypto");
const userService = require("./user.service");
const Provider = require("../util/enums").provider;
const Constants = require("../util/constants");
const privateKeyPath = path.join(__dirname, "..", process.env.PRIVATE_KEY_PATH);
const frontEndCallbackUrl = `${process.env.FRONTEND_APP_URL}/callback`;

module.exports.register = (req, res, next) => {
  const errors = validateRegistration(req.body);
  if (errors.length) {
    return res.status(400).json({ errors });
  }
  userService.verifyEmailAvailable(req, res, () => {
    const saltHash = crypto.generateSaltAndHash(req.body.password);
    const user = new User({
      email: req.body.email,
      hash: saltHash.hash,
      salt: saltHash.salt,
      settings: {
        rememberMe: req.body.rememberMe | true,
      },
    });
    user.save((err, newUser) => {
      if (err) {
        return next(err);
      }
      console.log(`Successfully signed up new user: ${newUser.email}.`);
      const token = signJWTToken(newUser);
      res.json({ token: token.token, expiresIn: token.expiresIn, user: newUser });
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
    if (Provider.ADMIN.localeCompare(user.provider) !== 0 && Provider.LOCAL.localeCompare(user.provider) !== 0) {
      const error = `Email address signed-up using ${user.provider}. Please log-in using ${user.provider}.`;
      res.status(400).json({ error });
    }
    const isValid = crypto.validPassword(req.body.password, user.hash, user.salt);
    if (!isValid) {
      res.status(401).json({ error: "Invalid password." });
    } else {
      user.settings.rememberMe = req.body.rememberMe | true;
      user.save((err, updatedUser) => {
        if (err) {
          return next(err);
        }
        const token = signJWTToken(updatedUser);
        res.json({ token: token.token, expiresIn: token.expiresIn, user: updatedUser });
      });
    }
  });
};

module.exports.createOrUpdateSocialUser = function (socialInfo, done) {
  if (!socialInfo.profile.emails) {
    const err = `No email address was provided by ${socialInfo.provider}`;
    return done(err, null);
  }
  const email = socialInfo.profile.emails[0].value;
  let newUser = false;
  User.findOne({ email }, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user && user.provider.localeCompare(socialInfo.provider) !== 0) {
      const err = `Email address signed-up using ${user.provider}. Please log-in using ${user.provider}.`;
      return done(err, null);
    }
    if (!user) {
      newUser = true;
      user = new User({ email });
      user.provider = socialInfo.provider;
    }
    user.profile = extractUserInfo(socialInfo);
    user.save((err, savedUser) => {
      if (err) {
        return done(err, false);
      }
      if (newUser) {
        console.log(`Successfully signed up new ${socialInfo.provider} user: ${savedUser.email}.`);
      }
      return done(err, savedUser);
    });
  });
};

const extractUserInfo = (socialInfo) => {
  const profile = {};
  if (
    Provider.GITHUB.localeCompare(socialInfo.provider) === 0 ||
    Provider.TWITTER.localeCompare(socialInfo.provider) === 0
  ) {
    const displayName = socialInfo.profile?.displayName;
    profile.firstName = displayName?.split(" ")[0] || displayName;
    profile.lastName = displayName?.split(" ")[1];
  } else {
    profile.firstName = socialInfo.profile.name?.givenName || socialInfo.profile.displayName;
    profile.lastName = socialInfo.profile.name?.familyName;
  }
  profile.photoUrl = socialInfo.profile.photos[0]?.value;
  return profile;
};

const authenticate = (req, res, next) => {
  passport.authenticate(Provider.LOCAL, { session: false })(req, res, next);
};

module.exports.sendToken = (provider) => {
  return (req, res, next) => {
    passport.authenticate(provider || Provider.LOCAL, { session: false }, (err, user) => {
      if (err) {
        return res.status(401).json({ error: err });
      }
      if (user) {
        const token = signJWTToken(user);
        res.cookie("token", token.token);
        res.cookie("expiresIn", token.expiresIn);
        res.cookie("user", JSON.stringify(user));
        return res.clearCookie("connect.sid", { path: "/" }).redirect(frontEndCallbackUrl);
      } else {
        const error = "Unable to retrieve user information.";
        res.status(401).json({ error });
      }
    })(req, res, next);
  };
};

const signJWTToken = function (user) {
  const _id = user._id;
  const expiresIn = user.settings.rememberMe ? "1y" : "1m";
  const payload = { sub: _id };
  const token = jsonwebtoken.sign(payload, fs.readFileSync(privateKeyPath), {
    expiresIn,
    algorithm: "RS256",
  });
  return { token, expiresIn };
};

module.exports.authenticate = authenticate;

module.exports.authenticateAdmin = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.roles.filter((role) => role.equals(Role.ADMIN)).length === 0) {
      return res.sendStatus(403);
    }
    next();
  });
};

module.exports.nonAuthenticate = (req, res, next) => {
  passport.authenticate(Provider.LOCAL, { session: false }, (err, user) => {
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
    case Provider.GOOGLE: {
      return passport.authenticate(Provider.GOOGLE, {
        scope: ["email", "profile"],
      });
    }
    case Provider.GITHUB: {
      return passport.authenticate(Provider.GITHUB, {
        scope: ["user:email", "user:name"],
      });
    }
    case Provider.TWITTER: {
      return passport.authenticate(Provider.TWITTER);
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
  if (!request.confirmPassword) {
    errors.push("Please enter a matching password.");
  } else if (request.password && request.password.localeCompare(request.confirmPassword) !== 0) {
    errors.push("Passwords do not match.");
  }
  return errors;
};
