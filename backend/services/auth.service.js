const Constants = require("../util/constants");
const User = require("mongoose").model("User");
const provider = require("../util/enums").provider;
const authUtils = require("../auth/auth-utils");

module.exports.login = (req, res, next) => {
  const errors = validateLogin(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(404).json({ success: false, message: `No user found for email address: ${req.body.email}` });
    }
    const isValid = authUtils.validPassword(req.body.password, user.hash, user.salt);

    if (isValid) {
      const signedJWT = authUtils.issueJWT(user);
      return res.json({ success: true, user, token: signedJWT.token, expiresIn: signedJWT.expiresIn });
    } else {
      res.status(401).json({ success: false, error: "Invalid password" });
    }
  });
};

module.exports.register = (req, res, next) => {
  const errors = validateRegistration(req.body);
  if (errors.length) {
    return res.status(400).json({ errors });
  }
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      next(err);
    }
    if (user) {
      let error = "Email address already registered.";
      if (provider.LOCAL.localeCompare(user.provider) !== 0) {
        if (provider.ADMIN.localeCompare(user.provider) === 0) {
          error = `${error} Please check your email to validate your account.`;
        } else {
          error = `${error} Please log in using ${user.provider}.`;
        }
      }
      return res.status(400).json({ error });
    } else {
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
        const signedJWT = authUtils.issueJWT(user);
        console.log(`Successfully created new user for email address: ${newUser.email}.`);
        res.json({ success: true, user: newUser, token: signedJWT.token, expiresIn: signedJWT.expiresIn });
      });
    }
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
  } else if (request.password.length > 32) {
    errors.push("Password length should not exceed 32 characters.");
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
  } else if (request.password.length > 32) {
    errors.push("Password length should not exceed 32 characters.");
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
