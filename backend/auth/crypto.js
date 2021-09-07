const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

module.exports.generatePassword = function () {
  return crypto.randomBytes(32).toString("hex");
};

module.exports.generateSaltAndHash = function (password) {
  var salt = this.generatePassword();
  var hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return { salt, hash };
};

module.exports.validPassword = function (password, hash, salt) {
  const generatedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return hash === generatedHash;
};

module.exports.generateKeyPair = (done) => {
  const privateKeyPath = path.join(__dirname, "..", process.env.PRIVATE_KEY_PATH);
  const publicKeyPath = path.join(__dirname, "..", process.env.PUBLIC_KEY_PATH);
  let message = "Checking for public/private keypair..";
  try {
    if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
      console.log(`${message} keys found.`);
      done();
    } else {
      console.log(`${message} no keys found.`);
      message = "-- Creating new public/private keypair..";
      const keyPair = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
      });
      fs.writeFile(privateKeyPath, keyPair.privateKey, () => {
        fs.writeFile(publicKeyPath, keyPair.publicKey, () => {
          console.log(`${message} done.`);
          done();
        });
      });
    }
  } catch (err) {
    console.log(`${message} ${err.message}`);
  }
};
