const fs = require("fs");
const path = require("path");
const keys = require("../config/keys");
const sslKeyPath = path.join(__dirname, "..", keys.sslKey);
const sslCertificatePath = path.join(__dirname, "..", keys.sslCertificate);

module.exports.readCertificates = (next) => {
  let message = "Checking for SSL certificates..";
  try {
    if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertificatePath)) {
      const PRIV_KEY = fs.readFileSync(sslKeyPath);
      const PUB_KEY = fs.readFileSync(sslCertificatePath);
      console.log(`${message} certificates found.`);
      return next({ key: PRIV_KEY, cert: PUB_KEY });
    } else {
      console.log(`${message} no certificates found.`);
      return next(null);
    }
  } catch (err) {
    console.log(`${message} ${err.message}`);
  }
};
