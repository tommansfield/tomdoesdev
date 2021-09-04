const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const keys = require("../config/keys");

const privateKeyPath = path.join(__dirname, "..", keys.privateKey);

module.exports.generatePassword = function () {
  return crypto.randomBytes(32).toString("hex");
};

module.exports.generateSaltAndHash = function (password) {
  var salt = this.generatePassword();
  var hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return { salt, hash };
};

module.exports.validPassword = function (password, hash, salt) {
  const generatedHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return hash === generatedHash;
};

module.exports.issueJWT = function (user) {
  const _id = user._id;
  const expiresIn = user.settings.rememberMe ? "1y" : "2h";
  const payload = { sub: _id, iat: Date.now() };
  const token = jsonwebtoken.sign(payload, fs.readFileSync(privateKeyPath), {
    expiresIn,
    algorithm: "RS256",
  });
  return { token, expiresIn };
};
