const Constants = require("../util/constants");
const Role = require("mongoose").model("Role");
const User = require("mongoose").model("User");
const provider = require("../util/enums").provider;

exports.login = (req, res, next) => {
  res.send("logged in");
};

exports.register = (req, res, next) => {
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
    }
    res.send("registered");
  });
};

const validateRegistration = (request) => {
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
  } else if (request.password.localeCompare(request.matchingPassword) !== 0) {
    errors.push("Passwords do not match.");
  }
  return errors;
};
